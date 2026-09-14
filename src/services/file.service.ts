import { FileRecord } from '../types';
import { fileRepo, auditRepo, settingsRepo } from '../storage/repositories';

export interface UploadFileInput {
  userId: string;
  originalName: string;
  mimeType: string;
  size: number;
  visibility?: 'public' | 'private';
  contentBase64?: string;
}

export class FileService {
  private allowedMimeTypes = [
    'application/pdf',
    'application/json',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  async uploadFile(input: UploadFileInput): Promise<FileRecord> {
    // 1. Validate MIME
    if (!this.allowedMimeTypes.includes(input.mimeType)) {
      throw new Error(`نوع الملف (${input.mimeType}) غير مسموح به أمنياً.`);
    }

    // 2. Validate Size against settings
    const maxSizeSetting = await settingsRepo.getByKey('storage.max_upload_size_mb');
    const maxBytes = (maxSizeSetting ? Number(maxSizeSetting.value) : 50) * 1024 * 1024;
    if (input.size > maxBytes) {
      throw new Error(`حجم الملف يتجاوز الحد الأقصى المسموح (${maxSizeSetting?.value || 50} ميغابايت)`);
    }

    // 3. Prevent Path Traversal & Sanitize Name
    const sanitizedName = input.originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = sanitizedName.split('.').pop() || 'bin';
    const storedName = `store_${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;
    const path = `/storage/uploads/${storedName}`;

    // 4. Calculate File Hash (Mock SHA-256)
    const hash = `sha256_${Math.random().toString(36).substring(2)}${Date.now()}`;

    const file = await fileRepo.create({
      userId: input.userId,
      originalName: sanitizedName,
      storedName,
      path,
      mimeType: input.mimeType,
      extension: ext,
      size: input.size,
      hash,
      disk: 'local',
      visibility: input.visibility || 'private',
      status: 'ready',
    });

    await auditRepo.log({
      userId: input.userId,
      action: 'FILE_UPLOADED',
      resource: 'files',
      resourceId: file.id,
      status: 'success',
      ipAddress: '127.0.0.1',
      userAgent: 'File Storage Service',
      details: { originalName: file.originalName, size: file.size },
    });

    return file;
  }

  async deleteFile(fileId: string, userId: string, isAdmin = false): Promise<boolean> {
    const file = await fileRepo.findById(fileId);
    if (!file) return false;
    if (!isAdmin && file.userId !== userId) {
      throw new Error('غير مصرح لك بحذف هذا الملف');
    }

    await fileRepo.delete(fileId);
    await auditRepo.log({
      userId,
      action: 'FILE_DELETED',
      resource: 'files',
      resourceId: fileId,
      status: 'success',
      ipAddress: '127.0.0.1',
      userAgent: 'File Storage Service',
    });
    return true;
  }

  async getFile(fileId: string, userId: string, isAdmin = false): Promise<FileRecord | null> {
    const file = await fileRepo.findById(fileId);
    if (!file) return null;
    if (file.visibility === 'private' && !isAdmin && file.userId !== userId) {
      throw new Error('ملف خاص - لا تملك صلاحية الوصول');
    }
    await fileRepo.incrementDownloads(fileId);
    return file;
  }
}

export const fileService = new FileService();
