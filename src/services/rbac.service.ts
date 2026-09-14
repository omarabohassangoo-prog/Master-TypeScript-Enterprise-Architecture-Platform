import { User, Role, Permission } from '../types';
import { roleRepo, permissionRepo, userRepo } from '../storage/repositories';

export class RbacService {
  async getUserPermissions(user: User): Promise<string[]> {
    const permissionKeys = new Set<string>();

    for (const roleId of user.roles) {
      const role = await roleRepo.findById(roleId);
      if (role && role.status === 'active') {
        role.permissions.forEach(p => permissionKeys.add(p));
      }
    }

    // Super admins always have all permissions
    if (user.userType === 'super_admin') {
      const allPerms = await permissionRepo.findMany();
      allPerms.forEach(p => permissionKeys.add(p.key));
    }

    return Array.from(permissionKeys);
  }

  async can(user: User | null, permissionKey: string): Promise<boolean> {
    if (!user || user.status !== 'active') return false;
    if (user.userType === 'super_admin') return true;

    const userPerms = await this.getUserPermissions(user);
    return userPerms.includes(permissionKey);
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<boolean> {
    const user = await userRepo.findById(userId);
    const role = await roleRepo.findById(roleId);
    if (!user || !role) return false;

    if (!user.roles.includes(roleId)) {
      user.roles.push(roleId);
      await userRepo.update(userId, { roles: user.roles });
    }
    return true;
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    const user = await userRepo.findById(userId);
    if (!user) return false;

    user.roles = user.roles.filter(r => r !== roleId);
    await userRepo.update(userId, { roles: user.roles });
    return true;
  }
}

export const rbacService = new RbacService();
