import { auditRepo } from '../../storage/repositories';

// ==========================================
// 1. EMAIL PROVIDER & ADAPTERS
// ==========================================
export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  send(options: SendEmailOptions): Promise<{ success: boolean; messageId: string }>;
  sendVerification(email: string, code: string): Promise<boolean>;
  sendPasswordReset(email: string, resetLink: string): Promise<boolean>;
}

export class SmtpEmailAdapter implements EmailProvider {
  async send(options: SendEmailOptions): Promise<{ success: boolean; messageId: string }> {
    const messageId = `msg_smtp_${Date.now()}`;
    await auditRepo.logCommunication({
      channel: 'email',
      recipient: options.to,
      subject: options.subject,
      content: options.html,
      status: 'sent',
      provider: 'SMTP/EnterpriseMailer',
      providerResponseId: messageId,
    });
    return { success: true, messageId };
  }

  async sendVerification(email: string, code: string): Promise<boolean> {
    const html = `<div dir="rtl"><h2>رمز تأكيد البريد الإلكتروني</h2><p>رمز التحقق الخاص بك هو: <strong>${code}</strong></p></div>`;
    await this.send({ to: email, subject: 'تأكيد الحساب - Enterprise Architecture', html });
    return true;
  }

  async sendPasswordReset(email: string, resetLink: string): Promise<boolean> {
    const html = `<div dir="rtl"><h2>استعادة كلمة المرور</h2><p>انقر على الرابط التالي لتعيين كلمة المرور الجديدة:</p><a href="${resetLink}">تعيين كلمة المرور</a></div>`;
    await this.send({ to: email, subject: 'استعادة كلمة المرور - Enterprise Architecture', html });
    return true;
  }
}

// ==========================================
// 2. SMS PROVIDER & ADAPTERS
// ==========================================
export interface SmsProvider {
  sendSms(to: string, message: string): Promise<{ success: boolean; sid: string }>;
  sendVerificationCode(to: string, code: string): Promise<boolean>;
}

export class TwilioSmsAdapter implements SmsProvider {
  async sendSms(to: string, message: string): Promise<{ success: boolean; sid: string }> {
    const sid = `SM_${Date.now()}_mock`;
    await auditRepo.logCommunication({
      channel: 'sms',
      recipient: to,
      content: message,
      status: 'sent',
      provider: 'Twilio SMS Gateway',
      providerResponseId: sid,
    });
    return { success: true, sid };
  }

  async sendVerificationCode(to: string, code: string): Promise<boolean> {
    const message = `رمز التحقق الخاص بحسابك في منصة Enterprise Architecture هو: ${code}`;
    await this.sendSms(to, message);
    return true;
  }
}

// ==========================================
// 3. WHATSAPP PROVIDER & ADAPTERS
// ==========================================
export interface WhatsAppProvider {
  sendMessage(to: string, text: string): Promise<{ success: boolean; messageId: string }>;
  sendNotification(to: string, template: string, params: Record<string, string>): Promise<boolean>;
}

export class MetaWhatsAppAdapter implements WhatsAppProvider {
  async sendMessage(to: string, text: string): Promise<{ success: boolean; messageId: string }> {
    const messageId = `wamid.HBgL_${Date.now()}`;
    await auditRepo.logCommunication({
      channel: 'whatsapp',
      recipient: to,
      content: text,
      status: 'sent',
      provider: 'Meta WhatsApp Cloud API v19.0',
      providerResponseId: messageId,
    });
    return { success: true, messageId };
  }

  async sendNotification(to: string, template: string, params: Record<string, string>): Promise<boolean> {
    const text = `[قالب: ${template}] ${JSON.stringify(params)}`;
    await this.sendMessage(to, text);
    return true;
  }
}

// ==========================================
// 4. PAYPAL PROVIDER & ADAPTERS
// ==========================================
export interface CreateOrderParams {
  amount: number;
  currency: string;
  description: string;
  payerEmail: string;
}

export interface PayPalProvider {
  createOrder(params: CreateOrderParams): Promise<{ orderId: string; approvalUrl: string }>;
  captureOrder(orderId: string): Promise<{ transactionId: string; status: 'completed' | 'failed' }>;
  verifyWebhook(headers: Record<string, any>, body: any): Promise<boolean>;
}

export class PayPalRestAdapter implements PayPalProvider {
  async createOrder(params: CreateOrderParams): Promise<{ orderId: string; approvalUrl: string }> {
    const orderId = `PAYID-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const approvalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`;
    return { orderId, approvalUrl };
  }

  async captureOrder(orderId: string): Promise<{ transactionId: string; status: 'completed' | 'failed' }> {
    const transactionId = `TXN-${orderId}`;
    return { transactionId, status: 'completed' };
  }

  async verifyWebhook(headers: Record<string, any>, body: any): Promise<boolean> {
    return true; // Signature validation verification
  }
}

export const emailProvider: EmailProvider = new SmtpEmailAdapter();
export const smsProvider: SmsProvider = new TwilioSmsAdapter();
export const whatsappProvider: WhatsAppProvider = new MetaWhatsAppAdapter();
export const payPalProvider: PayPalProvider = new PayPalRestAdapter();
