import { db } from '../database.manager';
import {
  User, Role, Permission, Session, Setting, FileRecord,
  Notification, PayPalSystemSettings, PayPalTransaction,
  AuditLog, CommunicationLog, DevProject, DevTask, DevIssue
} from '../../types';

// ==========================================
// USER REPOSITORY
// ==========================================
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    db.recordQuery();
    return db.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    db.recordQuery();
    const normalized = email.trim().toLowerCase();
    for (const user of db.users.values()) {
      if (user.email.toLowerCase() === normalized && !user.deletedAt) {
        return user;
      }
    }
    return null;
  }

  async findByUsername(username: string): Promise<User | null> {
    db.recordQuery();
    const normalized = username.trim().toLowerCase();
    for (const user of db.users.values()) {
      if (user.username.toLowerCase() === normalized && !user.deletedAt) {
        return user;
      }
    }
    return null;
  }

  async findMany(filter?: { status?: string; userType?: string; search?: string }): Promise<User[]> {
    db.recordQuery();
    let list = Array.from(db.users.values()).filter(u => u && !u.deletedAt);
    if (filter?.status) list = list.filter(u => u.status === filter.status);
    if (filter?.userType) list = list.filter(u => u.userType === filter.userType);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(u =>
        (u.username || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.profile?.fullName || '').toLowerCase().includes(q)
      );
    }
    return list;
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'failedLoginAttempts'>): Promise<User> {
    db.recordQuery();
    const now = new Date().toISOString();
    const newUser: User = {
      ...data,
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      failedLoginAttempts: 0,
      createdAt: now,
      updatedAt: now,
    };
    db.users.set(newUser.id, newUser);
    return newUser;
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    db.recordQuery();
    const user = db.users.get(id);
    if (!user) return null;
    const updated: User = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    db.users.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    db.recordQuery();
    const user = db.users.get(id);
    if (!user) return false;
    user.deletedAt = new Date().toISOString();
    user.status = 'inactive';
    db.users.set(id, user);
    return true;
  }
}

// ==========================================
// ROLE & PERMISSION REPOSITORY
// ==========================================
export class RoleRepository {
  async findById(id: string): Promise<Role | null> {
    db.recordQuery();
    return db.roles.get(id) || null;
  }

  async findByName(name: string): Promise<Role | null> {
    db.recordQuery();
    for (const role of db.roles.values()) {
      if (role.name === name) return role;
    }
    return null;
  }

  async findMany(): Promise<Role[]> {
    db.recordQuery();
    return Array.from(db.roles.values());
  }

  async create(data: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    db.recordQuery();
    const now = new Date().toISOString();
    const newRole: Role = {
      ...data,
      id: `role_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    db.roles.set(newRole.id, newRole);
    return newRole;
  }

  async update(id: string, updates: Partial<Role>): Promise<Role | null> {
    db.recordQuery();
    const role = db.roles.get(id);
    if (!role) return null;
    const updated: Role = {
      ...role,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    db.roles.set(id, updated);
    return updated;
  }
}

export class PermissionRepository {
  async findMany(): Promise<Permission[]> {
    db.recordQuery();
    return Array.from(db.permissions.values());
  }

  async findByKey(key: string): Promise<Permission | null> {
    db.recordQuery();
    for (const p of db.permissions.values()) {
      if (p.key === key) return p;
    }
    return null;
  }
}

// ==========================================
// SESSION REPOSITORY
// ==========================================
export class SessionRepository {
  async findById(id: string): Promise<Session | null> {
    db.recordQuery();
    return db.sessions.get(id) || null;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    db.recordQuery();
    return Array.from(db.sessions.values()).filter(s => s.userId === userId && !s.revokedAt);
  }

  async create(data: Omit<Session, 'id' | 'createdAt'>): Promise<Session> {
    db.recordQuery();
    const now = new Date().toISOString();
    const newSession: Session = {
      ...data,
      id: `sess_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      createdAt: now,
    };
    db.sessions.set(newSession.id, newSession);
    return newSession;
  }

  async revoke(id: string): Promise<boolean> {
    db.recordQuery();
    const s = db.sessions.get(id);
    if (!s) return false;
    s.revokedAt = new Date().toISOString();
    db.sessions.set(id, s);
    return true;
  }

  async revokeAllForUser(userId: string): Promise<number> {
    db.recordQuery();
    let count = 0;
    const now = new Date().toISOString();
    for (const s of db.sessions.values()) {
      if (s.userId === userId && !s.revokedAt) {
        s.revokedAt = now;
        db.sessions.set(s.id, s);
        count++;
      }
    }
    return count;
  }
}

// ==========================================
// SETTINGS REPOSITORY
// ==========================================
export class SettingsRepository {
  async getByKey(key: string): Promise<Setting | null> {
    db.recordQuery();
    return db.settings.get(key) || null;
  }

  async getAll(): Promise<Setting[]> {
    db.recordQuery();
    return Array.from(db.settings.values());
  }

  async getPublicSettings(): Promise<Setting[]> {
    db.recordQuery();
    return Array.from(db.settings.values()).filter(s => s.isPublic);
  }

  async set(key: string, value: any): Promise<Setting> {
    db.recordQuery();
    const now = new Date().toISOString();
    const existing = db.settings.get(key);
    if (existing) {
      existing.value = value;
      existing.updatedAt = now;
      db.settings.set(key, existing);
      return existing;
    }
    const newSetting: Setting = {
      id: `set_${Date.now()}`,
      key,
      value,
      type: typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string',
      group: 'general',
      isPublic: false,
      label: key,
      description: '',
      createdAt: now,
      updatedAt: now,
    };
    db.settings.set(key, newSetting);
    return newSetting;
  }
}

// ==========================================
// FILE REPOSITORY
// ==========================================
export class FileRepository {
  async findById(id: string): Promise<FileRecord | null> {
    db.recordQuery();
    return db.files.get(id) || null;
  }

  async findByUserId(userId: string): Promise<FileRecord[]> {
    db.recordQuery();
    return Array.from(db.files.values()).filter(f => f.userId === userId);
  }

  async findMany(): Promise<FileRecord[]> {
    db.recordQuery();
    return Array.from(db.files.values());
  }

  async create(file: Omit<FileRecord, 'id' | 'createdAt' | 'updatedAt' | 'downloadsCount'>): Promise<FileRecord> {
    db.recordQuery();
    const now = new Date().toISOString();
    const newFile: FileRecord = {
      ...file,
      id: `file_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      downloadsCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    db.files.set(newFile.id, newFile);
    return newFile;
  }

  async delete(id: string): Promise<boolean> {
    db.recordQuery();
    return db.files.delete(id);
  }

  async incrementDownloads(id: string): Promise<void> {
    db.recordQuery();
    const file = db.files.get(id);
    if (file) {
      file.downloadsCount++;
      file.updatedAt = new Date().toISOString();
      db.files.set(id, file);
    }
  }
}

// ==========================================
// NOTIFICATIONS REPOSITORY
// ==========================================
export class NotificationRepository {
  async findByUserId(userId: string): Promise<Notification[]> {
    db.recordQuery();
    return Array.from(db.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async create(data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    db.recordQuery();
    const newNotif: Notification = {
      ...data,
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    db.notifications.set(newNotif.id, newNotif);
    return newNotif;
  }

  async markAsRead(id: string): Promise<boolean> {
    db.recordQuery();
    const notif = db.notifications.get(id);
    if (!notif) return false;
    notif.readAt = new Date().toISOString();
    db.notifications.set(id, notif);
    return true;
  }

  async markAllAsRead(userId: string): Promise<number> {
    db.recordQuery();
    let count = 0;
    const now = new Date().toISOString();
    for (const n of db.notifications.values()) {
      if (n.userId === userId && !n.readAt) {
        n.readAt = now;
        db.notifications.set(n.id, n);
        count++;
      }
    }
    return count;
  }
}

// ==========================================
// PAYPAL REPOSITORY
// ==========================================
export class PayPalRepository {
  async getSystemSettings(): Promise<PayPalSystemSettings> {
    db.recordQuery();
    return db.paypalSettings;
  }

  async updateSystemSettings(updates: Partial<PayPalSystemSettings>): Promise<PayPalSystemSettings> {
    db.recordQuery();
    db.paypalSettings = {
      ...db.paypalSettings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return db.paypalSettings;
  }

  async findTransactions(userId?: string): Promise<PayPalTransaction[]> {
    db.recordQuery();
    let list = Array.from(db.paypalTransactions.values());
    if (userId) list = list.filter(t => t.userId === userId);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createTransaction(data: Omit<PayPalTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<PayPalTransaction> {
    db.recordQuery();
    const now = new Date().toISOString();
    const newTx: PayPalTransaction = {
      ...data,
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now,
    };
    db.paypalTransactions.set(newTx.id, newTx);
    return newTx;
  }
}

// ==========================================
// AUDIT & COMMUNICATION REPOSITORY
// ==========================================
export class AuditRepository {
  async log(entry: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    db.recordQuery();
    const log: AuditLog = {
      ...entry,
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    db.auditLogs.unshift(log);
    if (db.auditLogs.length > 500) db.auditLogs.pop();
    return log;
  }

  async findMany(limit = 100): Promise<AuditLog[]> {
    db.recordQuery();
    return db.auditLogs.slice(0, limit);
  }

  async logCommunication(entry: Omit<CommunicationLog, 'id' | 'createdAt'>): Promise<CommunicationLog> {
    db.recordQuery();
    const log: CommunicationLog = {
      ...entry,
      id: `comm_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    db.communicationLogs.unshift(log);
    return log;
  }

  async findCommunicationLogs(): Promise<CommunicationLog[]> {
    db.recordQuery();
    return db.communicationLogs;
  }
}

// ==========================================
// DEV WORKBENCH REPOSITORY
// ==========================================
export class DevRepository {
  async getProjects(): Promise<DevProject[]> {
    db.recordQuery();
    return Array.from(db.devProjects.values());
  }

  async getTasks(projectId?: string): Promise<DevTask[]> {
    db.recordQuery();
    let tasks = Array.from(db.devTasks.values());
    if (projectId) tasks = tasks.filter(t => t.projectId === projectId);
    return tasks;
  }

  async updateTaskStatus(taskId: string, status: DevTask['status']): Promise<DevTask | null> {
    db.recordQuery();
    const task = db.devTasks.get(taskId);
    if (!task) return null;
    task.status = status;
    db.devTasks.set(taskId, task);
    return task;
  }

  async createTask(data: Omit<DevTask, 'id'>): Promise<DevTask> {
    db.recordQuery();
    const task: DevTask = {
      ...data,
      id: `task_${Date.now()}`,
    };
    db.devTasks.set(task.id, task);
    return task;
  }

  async getIssues(): Promise<DevIssue[]> {
    db.recordQuery();
    return Array.from(db.devIssues.values());
  }

  async createIssue(data: Omit<DevIssue, 'id' | 'createdAt'>): Promise<DevIssue> {
    db.recordQuery();
    const issue: DevIssue = {
      ...data,
      id: `iss_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.devIssues.set(issue.id, issue);
    return issue;
  }
}

export const userRepo = new UserRepository();
export const roleRepo = new RoleRepository();
export const permissionRepo = new PermissionRepository();
export const sessionRepo = new SessionRepository();
export const settingsRepo = new SettingsRepository();
export const fileRepo = new FileRepository();
export const notifRepo = new NotificationRepository();
export const paypalRepo = new PayPalRepository();
export const auditRepo = new AuditRepository();
export const devRepo = new DevRepository();
