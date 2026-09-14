import { User, UserProfile } from '../types';
import { userRepo, auditRepo } from '../storage/repositories';
import { sessionService } from './session.service';
import { emailProvider } from './providers';
import { rbacService } from './rbac.service';

export interface LoginDTO {
  emailOrUsername: string;
  password?: string;
  ipAddress?: string;
  userAgent?: string;
  fingerprintHash?: string;
}

export interface RegisterDTO {
  email: string;
  username: string;
  fullName: string;
  password?: string;
  phone?: string;
  userType?: 'customer' | 'developer';
}

export class AuthService {
  async login(dto: LoginDTO): Promise<{ user: User; token: string; permissions: string[] }> {
    const identifier = dto.emailOrUsername.trim();
    let user = await userRepo.findByEmail(identifier);
    if (!user) {
      user = await userRepo.findByUsername(identifier);
    }

    const ip = dto.ipAddress || '127.0.0.1';
    const ua = dto.userAgent || 'Web Browser';

    if (!user) {
      await auditRepo.log({
        action: 'AUTH_LOGIN_FAILED',
        resource: 'auth',
        status: 'failure',
        ipAddress: ip,
        userAgent: ua,
        details: { identifier, reason: 'USER_NOT_FOUND' },
      });
      throw new Error('بيانات الدخول غير صحيحة أو الحساب غير موجود');
    }

    // Check Lockout
    if (user.lockoutUntil && new Date(user.lockoutUntil).getTime() > Date.now()) {
      await auditRepo.log({
        userId: user.id,
        username: user.username,
        action: 'AUTH_LOCKOUT_BLOCKED',
        resource: 'auth',
        status: 'failure',
        ipAddress: ip,
        userAgent: ua,
        details: { lockoutUntil: user.lockoutUntil },
      });
      throw new Error(`الحساب مقفل مؤقتاً لأسباب أمنية حتى ${new Date(user.lockoutUntil).toLocaleTimeString('ar-SA')}`);
    }

    if (user.status === 'suspended') {
      throw new Error('الحساب معطل أو موقوف من قبل الإدارة.');
    }

    // Successful login - reset failed attempts & update lastLogin
    const now = new Date().toISOString();
    await userRepo.update(user.id, {
      failedLoginAttempts: 0,
      lockoutUntil: null,
      lastLoginAt: now,
    });

    const { token } = await sessionService.createSession({
      userId: user.id,
      ipAddress: ip,
      userAgent: ua,
      fingerprintHash: dto.fingerprintHash,
    });

    await auditRepo.log({
      userId: user.id,
      username: user.username,
      action: 'AUTH_LOGIN_SUCCESS',
      resource: 'auth',
      status: 'success',
      ipAddress: ip,
      userAgent: ua,
      details: { userType: user.userType },
    });

    const permissions = await rbacService.getUserPermissions(user);
    const updatedUser = (await userRepo.findById(user.id)) || user;

    return { user: updatedUser, token, permissions };
  }

  async register(dto: RegisterDTO): Promise<{ user: User; token: string; permissions: string[] }> {
    const existingEmail = await userRepo.findByEmail(dto.email);
    if (existingEmail) {
      throw new Error('البريد الإلكتروني مسجل مسبقاً في النظام');
    }

    const existingUser = await userRepo.findByUsername(dto.username);
    if (existingUser) {
      throw new Error('اسم المستخدم محجوز، يرجى اختيار اسم مستخدم آخر');
    }

    const userType = dto.userType || 'customer';
    const defaultRole = userType === 'developer' ? 'role_developer' : 'role_user';

    const newUser = await userRepo.create({
      email: dto.email.trim().toLowerCase(),
      username: dto.username.trim().toLowerCase(),
      phone: dto.phone,
      passwordHash: 'sha256_hashed_secure_pass',
      userType,
      status: 'active',
      emailVerifiedAt: new Date().toISOString(),
      phoneVerifiedAt: null,
      lastLoginAt: new Date().toISOString(),
      profile: {
        fullName: dto.fullName,
        preferredLanguage: 'ar',
        theme: 'dark',
        twoFactorEnabled: false,
        country: 'Saudi Arabia',
      },
      roles: [defaultRole],
    });

    // Send verification email simulation
    await emailProvider.sendVerification(newUser.email, '789123');

    const { token } = await sessionService.createSession({
      userId: newUser.id,
      ipAddress: '127.0.0.1',
      userAgent: 'Web Browser Registration',
    });

    await auditRepo.log({
      userId: newUser.id,
      username: newUser.username,
      action: 'AUTH_REGISTER_SUCCESS',
      resource: 'auth',
      status: 'success',
      ipAddress: '127.0.0.1',
      userAgent: 'Registration Engine',
    });

    const permissions = await rbacService.getUserPermissions(newUser);
    return { user: newUser, token, permissions };
  }

  async forgotPassword(email: string): Promise<boolean> {
    const user = await userRepo.findByEmail(email);
    if (!user) return false;
    const resetToken = `rst_${Math.random().toString(36).substring(2)}`;
    await emailProvider.sendPasswordReset(user.email, `https://enterprise.local/reset-password?token=${resetToken}`);
    return true;
  }
}

export const authService = new AuthService();
