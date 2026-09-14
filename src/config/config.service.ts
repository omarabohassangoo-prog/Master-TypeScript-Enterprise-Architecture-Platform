import systemConfig from './system.json';
import seoConfig from './seo.json';
import routesConfig from './routes.json';
import menusConfig from './menus.json';
import permissionsConfig from './permissions.json';
import userTypesConfig from './user-types.json';
import featureFlagsConfig from './feature-flags.json';

export class ConfigService {
  private static instance: ConfigService;

  private constructor() {}

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public getSystemInfo() {
    return systemConfig.system;
  }

  public getSeoInfo() {
    return seoConfig.seo;
  }

  public getRoutes() {
    return routesConfig;
  }

  public getMenus() {
    return menusConfig;
  }

  public getPermissions() {
    return permissionsConfig.permissions;
  }

  public getUserTypes() {
    return userTypesConfig.userTypes;
  }

  public getFeatureFlags() {
    return featureFlagsConfig.flags;
  }

  public getEnv(key: string, defaultValue = ''): string {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
    return defaultValue;
  }

  public isProduction(): boolean {
    return this.getEnv('NODE_ENV') === 'production';
  }

  public getDatabaseConfig() {
    return {
      url: this.getEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/enterprise_db'),
      poolMin: parseInt(this.getEnv('DATABASE_POOL_MIN', '2'), 10),
      poolMax: parseInt(this.getEnv('DATABASE_POOL_MAX', '10'), 10),
    };
  }

  public getPayPalConfig() {
    return {
      mode: this.getEnv('PAYPAL_MODE', 'sandbox'),
      clientId: this.getEnv('PAYPAL_CLIENT_ID', 'sandbox_client_id_master_001'),
      hasSecret: !!this.getEnv('PAYPAL_CLIENT_SECRET'),
      webhookId: this.getEnv('PAYPAL_WEBHOOK_ID', 'WH-MOCK-99120'),
    };
  }

  public getEmailConfig() {
    return {
      host: this.getEnv('SMTP_HOST', 'smtp.mailtrap.io'),
      port: parseInt(this.getEnv('SMTP_PORT', '2525'), 10),
      from: this.getEnv('EMAIL_FROM_ADDRESS', 'no-reply@enterprise.local'),
      fromName: this.getEnv('EMAIL_FROM_NAME', 'Enterprise Master System'),
    };
  }
}

export const configService = ConfigService.getInstance();
