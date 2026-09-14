import { Notification, NotificationChannel, NotificationType } from '../types';
import { notifRepo, userRepo } from '../storage/repositories';
import { emailProvider, smsProvider, whatsappProvider } from './providers';

export interface DispatchNotificationInput {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export class NotificationService {
  async send(input: DispatchNotificationInput): Promise<Notification> {
    const notif = await notifRepo.create({
      userId: input.userId,
      type: input.type,
      channel: input.channel,
      title: input.title,
      message: input.message,
      data: input.data,
      readAt: null,
    });

    const user = await userRepo.findById(input.userId);

    // Multi-channel dispatch
    if (input.channel === 'email' && user?.email) {
      await emailProvider.send({
        to: user.email,
        subject: input.title,
        html: `<p>${input.message}</p>`,
      });
    } else if (input.channel === 'sms' && user?.phone) {
      await smsProvider.sendSms(user.phone, `${input.title}: ${input.message}`);
    } else if (input.channel === 'whatsapp' && user?.phone) {
      await whatsappProvider.sendMessage(user.phone, `*${input.title}*\n${input.message}`);
    }

    return notif;
  }

  async markAsRead(id: string): Promise<boolean> {
    return notifRepo.markAsRead(id);
  }

  async markAllAsRead(userId: string): Promise<number> {
    return notifRepo.markAllAsRead(userId);
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return notifRepo.findByUserId(userId);
  }
}

export const notificationService = new NotificationService();
