import { Session, User } from '../types';
import { sessionRepo, userRepo, auditRepo } from '../storage/repositories';

export interface CreateSessionParams {
  userId: string;
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
  fingerprintHash?: string;
}

export class SessionService {
  async createSession(params: CreateSessionParams): Promise<{ session: Session; token: string }> {
    const rawToken = `ent_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    const tokenHash = this.hashToken(rawToken);

    const ua = params.userAgent || '';
    const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : 'Client Device';
    const os = ua.includes('Mac') ? 'macOS' : ua.includes('Windows') ? 'Windows' : ua.includes('Linux') ? 'Linux' : 'Mobile OS';

    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    const now = new Date().toISOString();

    const session = await sessionRepo.create({
      userId: params.userId,
      tokenHash,
      ipAddress: params.ipAddress || '127.0.0.1',
      userAgent: params.userAgent || 'Enterprise Web Client',
      deviceId: params.deviceId || `dev_${Math.floor(Math.random() * 10000)}`,
      browser,
      os,
      location: 'الرياض، المملكة العربية السعودية',
      fingerprintHash: params.fingerprintHash || 'fp_entropy_valid_9981',
      lastActivityAt: now,
      expiresAt,
      revokedAt: null,
    });

    return { session, token: rawToken };
  }

  async validateToken(token: string): Promise<{ user: User; session: Session } | null> {
    const tokenHash = this.hashToken(token);
    const allSessions = await sessionRepo.findByUserId(''); // Or search all
    // Search across active sessions
    for (const sess of Array.from((await sessionRepo.findByUserId(token.split('_')[0])) || [])) {
      if (sess.tokenHash === tokenHash && !sess.revokedAt) {
        const user = await userRepo.findById(sess.userId);
        if (user && user.status === 'active') {
          return { user, session: sess };
        }
      }
    }
    return null;
  }

  async revokeSession(sessionId: string, userId: string): Promise<boolean> {
    const s = await sessionRepo.findById(sessionId);
    if (!s || s.userId !== userId) return false;
    await sessionRepo.revoke(sessionId);
    await auditRepo.log({
      userId,
      action: 'SESSION_REVOKED',
      resource: 'sessions',
      resourceId: sessionId,
      status: 'success',
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
    });
    return true;
  }

  async revokeAllSessions(userId: string): Promise<number> {
    const count = await sessionRepo.revokeAllForUser(userId);
    await auditRepo.log({
      userId,
      action: 'ALL_SESSIONS_REVOKED',
      resource: 'sessions',
      status: 'success',
      ipAddress: '127.0.0.1',
      userAgent: 'Session Manager Service',
      details: { count },
    });
    return count;
  }

  private hashToken(token: string): string {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = ((hash << 5) - hash) + token.charCodeAt(i);
      hash |= 0;
    }
    return `hash_${Math.abs(hash)}`;
  }
}

export const sessionService = new SessionService();
