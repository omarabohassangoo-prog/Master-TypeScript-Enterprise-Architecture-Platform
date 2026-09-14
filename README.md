# Master TypeScript Enterprise Architecture Platform

> نظام برمجي متكامل متعدد الطبقات بلغة TypeScript مع لوحات تحكم للمدير وفريق التطوير والمستخدمين ونظام صلاحيات RBAC وخدمات الدفع والاتصالات والتخزين.

---

## 🌟 نبذة عن النظام (Overview)

منظومة مؤسسية متكاملة مصممة بأسلوب المعمارية متعددة الطبقات (Multi-Tier Architecture)، تعتمد على TypeScript بالكامل في العميل والاطار الخادمي (React 18 + Express Engine). تلتزم المنظومة بأعلى معايير الأمن والجودة، وتوفر شاشات تحكم مخصصة للمدير (Admin)، فريق التطوير (Developer)، والمستخدمين (Customer Portal).

---

## 🏗️ البنية المعمارية (System Architecture)

```
                       ┌──────────────────────────────────────────┐
                       │     React 18 + Tailwind Client SPA       │
                       └────────────────────┬─────────────────────┘
                                            │
                                  REST API / JSON Proxy
                                            │
                       ┌────────────────────▼─────────────────────┐
                       │       Express.js TypeScript Engine       │
                       └──────────┬──────────────────────┬────────┘
                                  │                      │
                  ┌───────────────▼───────┐      ┌───────▼───────────────┐
                  │ PostgreSQL (Pool/ORM) │      │ External Provider SDKs │
                  └───────────────────────┘      └───────────────────────┘
                                                 (PayPal, SendGrid, Twilio)
```

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Express.js, Node.js (TypeScript stripping / esbuild bundler)
- **Database**: PostgreSQL (`pg.Pool` connection pool with Drizzle ORM readiness)
- **State & Storage**: System Settings Resolver (`SYSTEM-USER-SETTINGS-001`), AES-256 File Vault
- **Background Jobs**: Async Background Job Queue Engine (`bullmq` ready interface)
- **APM & Monitoring**: Real-time System Performance & Latency Metrics Monitor

---

## 🚀 التشغيل المحلي (Local Quickstart)

### 1. المتطلبات السابقة (Prerequisites)
- Node.js `v18.x` أو أعلى
- npm `v9.x` أو أعلى

### 2. التثبيت والتشغيل (Installation & Development)
```bash
# 1. استنساخ المستودع
git clone https://github.com/your-org/master-enterprise-platform.git
cd master-enterprise-platform

# 2. تثبيت الحزم والاعتمادات
npm install

# 3. إعداد متغيرات البيئة
cp .env.example .env

# 4. تشغيل خادم التطوير
npm run dev
```
سيكون التطبيق متاحاً على `http://localhost:3000`.

---

## 📦 النشر المباشر عبر GitHub (GitHub Deployment)

للحصول على دليل النشر التفصيلي عبر GitHub Actions و Docker و Cloud Run، يرجى مراجعة **[دليل النشر التخصصي عبر GitHub](docs/deployment/GITHUB-DEPLOYMENT-GUIDE.md)**.

### خطواط النشر السريعة:
1. **GitHub Actions**: ينطلق خط أنابيب التحرير والتحقق `.github/workflows/ci.yml` تلقائياً عند كل طلب سحب `Pull Request` أو دمج في `main`.
2. **Docker Container**: يحتوي المشروع على `Dockerfile` جاهز لبناء واستكشاف الحاوية خفيفة الوزن وتجهيز مسار الإنتاج `dist/server.cjs`.
3. **Environment Secrets**: أضف المتغيرات في مستودع GitHub الخاص بك تحت `Settings -> Secrets and variables -> Actions`.

---

## 📚 وثائق المنظومة (Documentation Matrix)

تتضمن المنظومة 14 وثيقة ومخطط تفاعلي متوفرة في المجلد `/docs`:

- **[وثيقة المستثمرين وتوقعات الأرباح بالدولار والمشاريع المستهدفة (Investor Pitch Deck & Financials)](docs/INVESTOR-PITCH-DECK.md)**
- **[وثيقة الترخيص وحقوق النشر (Copyright & License Document)](docs/COPYRIGHT-AND-LICENSE.md)**
- **[وثيقة الشروط والقوانين والامتثال التنظيمي (Legal Compliance, Terms, & Regulations)](docs/LEGAL-COMPLIANCE-RULES.md)**
- **[دليل النشر عبر GitHub](docs/deployment/GITHUB-DEPLOYMENT-GUIDE.md)**
- **[مواصفات النشر الإجمالية](docs/deployment/DEPLOYMENT-SPECIFICATION.md)**
- **[مواصفات إعدادات النظام والمستخدم](docs/architecture/System-User-Settings-Specification.md)**
- **[معايير دمج المزودين والـ SDKs](docs/backend/SDK-Integration-And-Testing-Specification.md)**
- **[معايير قاعدة البيانات PostgreSQL](docs/database/PostgreSQL-SDK-Integration-Specification.md)**

---

## ✉️ للتواصل والاستفسارات الاستثمارية (Investor Contact)

- **المطور الرئيسي والمالك للمنظومة**: عمر أبو حسان (Omar Abu Hassan)
- **البريد الإلكتروني المباشر**: **[omarabohassangoo@gmail.com](mailto:omarabohassangoo@gmail.com)**

---

## 📜 الترخيص (License)

هذا المشروع مرخص بموجب ترخيص **MIT License**.
