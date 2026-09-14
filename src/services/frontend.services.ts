import { api } from '../api/client';
import { User, Role, Permission, Setting, FileRecord, PayPalTransaction, AuditLog, CommunicationLog } from '../types';

export const AuthService = {
  login: async (credentials: { username: string; password?: string; deviceId?: string }) => {
    return api.post('/api/v1/auth/login', credentials);
  },
  logout: async () => {
    return api.post('/api/v1/auth/logout', {});
  },
  getCurrentUser: async () => {
    return api.get('/api/v1/auth/me');
  }
};

export const UserService = {
  getUsers: async (params?: { status?: string; userType?: string; search?: string }) => {
    return api.get('/api/v1/users', { params });
  },
  createUser: async (user: Partial<User>) => {
    return api.post('/api/v1/users', user);
  },
  updateUser: async (id: string, updates: Partial<User>) => {
    return api.put(`/api/v1/users/${id}`, updates);
  },
  deleteUser: async (id: string) => {
    return api.delete(`/api/v1/users/${id}`);
  }
};

export const RoleService = {
  getRoles: async () => {
    return api.get('/api/v1/roles');
  },
  updateRolePermissions: async (roleId: string, permissions: string[]) => {
    return api.put(`/api/v1/roles/${roleId}/permissions`, { permissions });
  },
  getPermissions: async () => {
    return api.get('/api/v1/permissions');
  }
};

export const FileService = {
  getFiles: async () => {
    return api.get('/api/v1/files');
  },
  uploadFile: async (fileData: Partial<FileRecord>) => {
    return api.post('/api/v1/files', fileData);
  },
  deleteFile: async (id: string) => {
    return api.delete(`/api/v1/files/${id}`);
  }
};

export const SettingsService = {
  getSettings: async () => {
    return api.get('/api/v1/settings');
  },
  updateSetting: async (key: string, value: string) => {
    return api.put(`/api/v1/settings/${key}`, { value });
  }
};

export const CommunicationService = {
  getLogs: async () => {
    return api.get('/api/v1/communications/logs');
  },
  sendMessage: async (msg: { channel: 'email' | 'sms' | 'whatsapp'; recipient: string; subject?: string; content: string }) => {
    return api.post('/api/v1/communications/send', msg);
  }
};

export const PaymentService = {
  getTransactions: async () => {
    return api.get('/api/v1/paypal/transactions');
  },
  createOrder: async (order: { amount: number; currency: string; description: string; userId: string }) => {
    return api.post('/api/v1/paypal/order', order);
  }
};
