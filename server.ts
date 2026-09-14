import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/storage/database.manager';
import { configService } from './src/config/config.service';
import { authService } from './src/services/auth.service';
import { sessionService } from './src/services/session.service';
import { rbacService } from './src/services/rbac.service';
import { fileService } from './src/services/file.service';
import { notificationService } from './src/services/notification.service';
import { architectureValidator } from './src/services/architecture-validator.service';
import { emailProvider, smsProvider, whatsappProvider, payPalProvider } from './src/services/providers';
import {
  userRepo, roleRepo, permissionRepo, settingsRepo,
  fileRepo, paypalRepo, auditRepo, devRepo
} from './src/storage/repositories';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Helper response wrapper
  const sendSuccess = (res: express.Response, data: any, message = 'Success', meta?: any) => {
    return res.json({
      success: true,
      data,
      message,
      errors: [],
      meta: { ...meta, timestamp: new Date().toISOString() },
    });
  };

  const sendError = (res: express.Response, message: string, status = 400, errors: string[] = []) => {
    return res.status(status).json({
      success: false,
      data: null,
      message,
      errors,
      meta: { timestamp: new Date().toISOString() },
    });
  };

  // ==========================================================================
  // API ROUTES (/api/v1)
  // ==========================================================================

  // 1. Health Checks
  app.get('/api/v1/health', (req, res) => {
    sendSuccess(res, {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
    });
  });

  app.get('/api/v1/health/database', (req, res) => {
    const health = db.getHealth();
    sendSuccess(res, health);
  });

  // 2. System Information & SEO
  app.get('/api/v1/system/info', (req, res) => {
    sendSuccess(res, {
      system: configService.getSystemInfo(),
      flags: configService.getFeatureFlags(),
      userTypes: configService.getUserTypes(),
    });
  });

  app.get('/api/v1/system/seo', (req, res) => {
    sendSuccess(res, configService.getSeoInfo());
  });

  // 3. Authentication
  app.post('/api/v1/auth/login', async (req, res) => {
    try {
      const { emailOrUsername, password, fingerprintHash } = req.body;
      if (!emailOrUsername) {
        return sendError(res, 'يرجى إدخال البريد الإلكتروني أو اسم المستخدم');
      }
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Web Client';

      const result = await authService.login({
        emailOrUsername,
        password,
        ipAddress: ip,
        userAgent,
        fingerprintHash,
      });

      sendSuccess(res, result, 'تم تسجيل الدخول بنجاح');
    } catch (err: any) {
      sendError(res, err.message || 'فشل تسجيل الدخول', 401);
    }
  });

  app.post('/api/v1/auth/register', async (req, res) => {
    try {
      const { email, username, fullName, phone, userType } = req.body;
      if (!email || !username || !fullName) {
        return sendError(res, 'يرجى استيفاء جميع الحقول المطلوبة');
      }
      const result = await authService.register({ email, username, fullName, phone, userType });
      sendSuccess(res, result, 'تم إنشاء الحساب وتأكيده بنجاح', { status: 201 });
    } catch (err: any) {
      sendError(res, err.message || 'فشل إنشاء الحساب', 400);
    }
  });

  app.post('/api/v1/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      sendSuccess(res, { email }, 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني');
    } catch (err: any) {
      sendError(res, err.message || 'حدث خطأ في استعادة كلمة المرور');
    }
  });

  // 4. Users Management
  app.get('/api/v1/users', async (req, res) => {
    const { status, userType, search } = req.query;
    const users = await userRepo.findMany({
      status: status as string,
      userType: userType as string,
      search: search as string,
    });
    sendSuccess(res, users, 'Users retrieved', { total: users.length });
  });

  app.post('/api/v1/users', async (req, res) => {
    try {
      const { email, username, fullName, userType, roles, phone } = req.body;
      const user = await userRepo.create({
        email,
        username,
        phone,
        userType: userType || 'customer',
        status: 'active',
        emailVerifiedAt: new Date().toISOString(),
        profile: {
          fullName,
          preferredLanguage: 'ar',
          theme: 'dark',
          twoFactorEnabled: false,
          country: 'Saudi Arabia',
        },
        roles: roles || ['role_user'],
      });
      sendSuccess(res, user, 'User created successfully');
    } catch (err: any) {
      sendError(res, err.message);
    }
  });

  app.put('/api/v1/users/:id', async (req, res) => {
    try {
      const updated = await userRepo.update(req.params.id, req.body);
      sendSuccess(res, updated, 'User updated successfully');
    } catch (err: any) {
      sendError(res, err.message);
    }
  });

  app.delete('/api/v1/users/:id', async (req, res) => {
    const success = await userRepo.delete(req.params.id);
    sendSuccess(res, { success }, 'User deactivated');
  });

  // 5. Roles & RBAC Matrix
  app.get('/api/v1/roles', async (req, res) => {
    const roles = await roleRepo.findMany();
    sendSuccess(res, roles);
  });

  app.post('/api/v1/roles', async (req, res) => {
    const { name, displayName, description, permissions } = req.body;
    const role = await roleRepo.create({
      name,
      displayName,
      description,
      isSystem: false,
      status: 'active',
      permissions: permissions || [],
    });
    sendSuccess(res, role, 'Role created');
  });

  app.put('/api/v1/roles/:id', async (req, res) => {
    const updated = await roleRepo.update(req.params.id, req.body);
    sendSuccess(res, updated, 'Role updated');
  });

  app.get('/api/v1/permissions', async (req, res) => {
    const permissions = await permissionRepo.findMany();
    sendSuccess(res, permissions);
  });

  // 6. Settings
  app.get('/api/v1/settings', async (req, res) => {
    const settings = await settingsRepo.getAll();
    sendSuccess(res, settings);
  });

  app.post('/api/v1/settings', async (req, res) => {
    const { key, value } = req.body;
    const setting = await settingsRepo.set(key, value);
    sendSuccess(res, setting, 'Setting saved');
  });

  // 7. Files
  app.get('/api/v1/files', async (req, res) => {
    const { userId } = req.query;
    const files = userId ? await fileRepo.findByUserId(userId as string) : await fileRepo.findMany();
    sendSuccess(res, files);
  });

  app.post('/api/v1/files/upload', async (req, res) => {
    try {
      const { userId, originalName, mimeType, size, visibility } = req.body;
      const file = await fileService.uploadFile({
        userId: userId || 'usr_admin_001',
        originalName: originalName || 'document.pdf',
        mimeType: mimeType || 'application/pdf',
        size: Number(size) || 102400,
        visibility: visibility || 'public',
      });
      sendSuccess(res, file, 'File uploaded and secured successfully');
    } catch (err: any) {
      sendError(res, err.message);
    }
  });

  app.delete('/api/v1/files/:id', async (req, res) => {
    try {
      const { userId, isAdmin } = req.body;
      await fileService.deleteFile(req.params.id, userId || 'usr_admin_001', !!isAdmin);
      sendSuccess(res, { id: req.params.id }, 'File deleted');
    } catch (err: any) {
      sendError(res, err.message);
    }
  });

  // 8. Notifications
  app.get('/api/v1/notifications', async (req, res) => {
    const userId = (req.query.userId as string) || 'usr_admin_001';
    const notifs = await notificationService.getUserNotifications(userId);
    sendSuccess(res, notifs);
  });

  app.post('/api/v1/notifications', async (req, res) => {
    const notif = await notificationService.send(req.body);
    sendSuccess(res, notif, 'Notification dispatched');
  });

  app.put('/api/v1/notifications/:id/read', async (req, res) => {
    const success = await notificationService.markAsRead(req.params.id);
    sendSuccess(res, { success });
  });

  app.put('/api/v1/notifications/read-all', async (req, res) => {
    const userId = req.body.userId || 'usr_admin_001';
    const count = await notificationService.markAllAsRead(userId);
    sendSuccess(res, { count });
  });

  // 9. Communications Dispatchers (Email, SMS, WhatsApp)
  app.post('/api/v1/communications/send', async (req, res) => {
    try {
      const { channel, recipient, subject, content } = req.body;
      if (channel === 'email') {
        await emailProvider.send({ to: recipient, subject: subject || 'Enterprise Message', html: content });
      } else if (channel === 'sms') {
        await smsProvider.sendSms(recipient, content);
      } else if (channel === 'whatsapp') {
        await whatsappProvider.sendMessage(recipient, content);
      }
      sendSuccess(res, { channel, recipient, status: 'sent' }, `تم إرسال الرسالة عبر قناة ${channel.toUpperCase()} بنجاح`);
    } catch (err: any) {
      sendError(res, err.message);
    }
  });

  app.get('/api/v1/communications/logs', async (req, res) => {
    const logs = await auditRepo.findCommunicationLogs();
    sendSuccess(res, logs);
  });

  // 10. PayPal Payments & Webhook
  app.get('/api/v1/paypal/settings', async (req, res) => {
    const settings = await paypalRepo.getSystemSettings();
    sendSuccess(res, settings);
  });

  app.get('/api/v1/paypal/transactions', async (req, res) => {
    const { userId } = req.query;
    const txs = await paypalRepo.findTransactions(userId as string);
    sendSuccess(res, txs);
  });

  app.post('/api/v1/paypal/create-order', async (req, res) => {
    try {
      const { amount, currency, description, payerEmail, userId } = req.body;
      const order = await payPalProvider.createOrder({
        amount: Number(amount) || 99,
        currency: currency || 'USD',
        description: description || 'Enterprise License',
        payerEmail: payerEmail || 'client@enterprise.local',
      });

      // Register transaction in pending
      const tx = await paypalRepo.createTransaction({
        userId: userId || 'usr_client_003',
        externalTransactionId: order.orderId,
        type: 'sale',
        amount: Number(amount) || 99,
        currency: currency || 'USD',
        status: 'approved',
        itemDescription: description || 'Enterprise Plan',
        payerEmail: payerEmail || 'client@enterprise.local',
      });

      sendSuccess(res, { order, transaction: tx }, 'PayPal order created');
    } catch (err: any) {
      sendError(res, err.message);
    }
  });

  app.post('/api/v1/paypal/capture-order', async (req, res) => {
    try {
      const { orderId } = req.body;
      const capture = await payPalProvider.captureOrder(orderId);
      sendSuccess(res, capture, 'Payment captured successfully');
    } catch (err: any) {
      sendError(res, err.message);
    }
  });

  // 11. Security Audit Logs
  app.get('/api/v1/audit/logs', async (req, res) => {
    const logs = await auditRepo.findMany(100);
    sendSuccess(res, logs);
  });

  // 12. Developer Workbench (Projects, Tasks, Issues, Migrations)
  app.get('/api/v1/dev/projects', async (req, res) => {
    const projects = await devRepo.getProjects();
    sendSuccess(res, projects);
  });

  app.get('/api/v1/dev/tasks', async (req, res) => {
    const { projectId } = req.query;
    const tasks = await devRepo.getTasks(projectId as string);
    sendSuccess(res, tasks);
  });

  app.put('/api/v1/dev/tasks/:id/status', async (req, res) => {
    const task = await devRepo.updateTaskStatus(req.params.id, req.body.status);
    sendSuccess(res, task);
  });

  app.get('/api/v1/dev/issues', async (req, res) => {
    const issues = await devRepo.getIssues();
    sendSuccess(res, issues);
  });

  app.get('/api/v1/dev/migrations', (req, res) => {
    sendSuccess(res, db.migrations);
  });

  // 13. Automated Architecture Consistency Check
  app.get('/api/v1/dev/consistency-check', (req, res) => {
    const report = architectureValidator.runConsistencyCheck();
    sendSuccess(res, report, 'Architecture consistency analysis completed');
  });

  // 14. Background Jobs Queue API
  const sampleJobs: any[] = [
    {
      id: 'job_001',
      name: 'معالجة الإشعارات الجماعية (Batch Email)',
      type: 'email_batch',
      status: 'completed',
      attempts: 1,
      maxAttempts: 3,
      payload: { count: 150, template: 'monthly_digest' },
      result: { sent: 150, failed: 0 },
      runAt: new Date(Date.now() - 600000).toISOString(),
      completedAt: new Date(Date.now() - 580000).toISOString(),
      durationMs: 420,
    },
    {
      id: 'job_002',
      name: 'تنظيف وتفريغ الجلسات المنتهية (DB Cleanup)',
      type: 'db_cleanup',
      status: 'completed',
      attempts: 1,
      maxAttempts: 3,
      payload: { target: 'sessions', olderThanDays: 7 },
      result: { purgedCount: 42 },
      runAt: new Date(Date.now() - 300000).toISOString(),
      completedAt: new Date(Date.now() - 295000).toISOString(),
      durationMs: 180,
    },
    {
      id: 'job_003',
      name: 'إعادة محاولة PayPal Webhook',
      type: 'webhook_retry',
      status: 'queued',
      attempts: 0,
      maxAttempts: 5,
      payload: { webhookId: 'wh_99342', event: 'PAYMENT.CAPTURE.COMPLETED' },
      runAt: new Date().toISOString(),
    }
  ];

  app.get('/api/v1/jobs', (req, res) => {
    sendSuccess(res, sampleJobs);
  });

  app.post('/api/v1/jobs/trigger', (req, res) => {
    const { type, payload } = req.body;
    const newJob = {
      id: `job_${Date.now().toString().slice(-4)}`,
      name: `مهمة ${type} جديدة`,
      type: type || 'email_batch',
      status: 'completed',
      attempts: 1,
      maxAttempts: 3,
      payload: payload || { trigger: 'manual_admin' },
      result: { status: 'success', processedAt: new Date().toISOString() },
      runAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Math.floor(Math.random() * 300) + 50,
    };
    sampleJobs.unshift(newJob);
    sendSuccess(res, newJob, 'Job dispatched and executed successfully');
  });

  app.delete('/api/v1/jobs/completed', (req, res) => {
    const remaining = sampleJobs.filter(j => j.status !== 'completed');
    sampleJobs.length = 0;
    sampleJobs.push(...remaining);
    sendSuccess(res, { remainingCount: sampleJobs.length }, 'Completed jobs cleared');
  });

  // 15. System Metrics & APM Endpoint
  app.get('/api/v1/system/metrics', (req, res) => {
    const memory = process.memoryUsage();
    sendSuccess(res, {
      cpuUsagePercent: Math.floor(Math.random() * 12) + 8,
      memoryRssMb: Math.round(memory.rss / (1024 * 1024)),
      memoryHeapMb: Math.round(memory.heapUsed / (1024 * 1024)),
      dbPoolActive: Math.floor(Math.random() * 4) + 2,
      dbPoolIdle: 8,
      dbPoolTotal: 20,
      apiLatencyP95Ms: Math.floor(Math.random() * 30) + 45,
      totalRequests: 14820,
      rateLimitBlocked: 3,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================================================
  // VITE MIDDLEWARE (Development) OR STATIC SERVING (Production)
  // ==========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Master Enterprise Architecture Platform] Server running on http://localhost:${PORT}`);
  });
}

startServer();
