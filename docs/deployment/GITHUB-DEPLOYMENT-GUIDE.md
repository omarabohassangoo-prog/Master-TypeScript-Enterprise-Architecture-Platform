# دليل النشر المباشر عبر مستودع GitHub (GitHub Deployment & CI/CD Guide)

> **وثيقة معمارية مرجعية**: تمثل الدليل الإرشادي والتنفيذي الشامل لنشر المنظومة بنجاح من مستودع GitHub إلى بيئات الاختبار والإنتاج (Staging & Production Containers).

---

## 📋 جدول المحتويات (Table of Contents)

1. [المتطلبات الأولية وتجهيز المستودع](#1-المتطلبات-الأولية-وتجهيز-المستودع)
2. [متغيرات البيئة وأسرار GitHub (Repository Secrets)](#2-متغيرات-البيئة-وأسرار-github)
3. [خطوط أنابيب التناغم المستمر (GitHub Actions CI/CD)](#3-خطوط-أنابيب-التناغم-المستمر)
4. [النشر عبر حاويات Docker (Docker Container Build)](#4-النشر-عبر-حاويات-docker)
5. [النشر على منصات السحاب (Cloud Run / AWS / DigitalOcean)](#5-النشر-على-منصات-السحاب)
6. [الربط بقاعدة البيانات وتطبيق الهجرات (Database Migrations)](#6-الربط-بقاعدة-البيانات-وتطبيق-الهجرات)
7. [التحقق والتفتيش بعد النشر (Post-Deployment Verification)](#7-التحقق-والتفتيش-بعد-النشر)

---

## 1. المتطلبات الأولية وتجهيز المستودع

قبل البدء بعملية النشر، تأكد من توافر الآتي:
- حساب فعال على GitHub مع صلاحية إنشاء المستودع وأسرار النظام (Repository Admin).
- التثبيت المحلي لـ Node.js v18+ و Git.
- تثبيت Docker Desktop (في حال رغبت بالبناء والتجربة المحلية للـ Containers).

```bash
# إنشاء المستودع ودفعه إلى GitHub
git init
git add .
git commit -m "feat: initial release of enterprise architecture platform"
git branch -M main
git remote add origin https://github.com/your-username/master-enterprise-platform.git
git push -u origin main
```

---

## 2. متغيرات البيئة وأسرار GitHub (Repository Secrets)

يجب إضافة الأسرار التالية في مستودع GitHub تحت المسار:
`Settings -> Secrets and variables -> Actions -> New repository secret`

| اسم السر (Secret Name) | الوصف (Description) | مثال / القيمة (Example) |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | مفتاح الاستدعاء الخادمي للذكاء الاصطناعي | `AIzaSyD...` |
| `DATABASE_URL` | رابط الاتصال بقاعدة بيانات PostgreSQL الحية | `postgres://user:pass@ep-host.gcp.neon.tech/db?sslmode=require` |
| `SENDGRID_API_KEY` | مفتاح مزود البريد الإلكتروني | `SG.xyz...` |
| `TWILIO_AUTH_TOKEN` | توكن الاعتماد لإرسال رسائل الـ SMS | `tw_auth_secret...` |
| `PAYPAL_CLIENT_ID` | المعرف العام لحساب PayPal Sandbox/Live | `PAYPAL_CLIENT_ID_EX` |
| `PAYPAL_CLIENT_SECRET` | المفتاح السري المعتمد لـ PayPal Gateway | `PAYPAL_SECRET_KEY_EX` |

---

## 3. خطوط أنابيب التناغم المستمر (GitHub Actions CI/CD)

تتضمن المنظومة خطة عمل تلقائية في المسار `.github/workflows/ci.yml` تعمل عند كل Push أو Pull Request:

### ميزات خطة التناغم CI:
- **Lint & TypeCheck**: تشغيل `npm run lint` لتأكيد صحة أنواع TypeScript وعدم وجود أي ثغرات أو أخطاء بناء.
- **Production Build Check**: التأكد من نجاح أمر البناء التجميعي `npm run build` لتوليد ملف الخادم `dist/server.cjs` وأصول العميل `dist/`.

---

## 4. النشر عبر حاويات Docker (Docker Container Build)

يحتوي المستودع على ملف `Dockerfile` بنظام البناء متعدد المراحل (Multi-Stage Build) لتأمين أفضل أداء وأصغر حجم للحاوية:

### أمر بناء وتجربة الحاوية محلياً:
```bash
# بناء الصورة
docker build -t enterprise-platform:latest .

# تشغيل الحاوية على منفذ 3000
docker run -d -p 3000:3000 --env-file .env enterprise-platform:latest
```

---

## 5. النشر على منصات السحاب

### أ. النشر على Google Cloud Run
يتضمن المستودع ملف العمل التلقائي `.github/workflows/deploy-cloudrun.yml`. بمجرد تفعيل أسرار GCP (`GCP_SA_KEY` و `GCP_PROJECT_ID`) يتم النشر تلقائياً:
1. بناء الحاوية ودفعها إلى Google Container Registry (GCR) / Artifact Registry.
2. توجيه الخدمة على Cloud Run وإتاحة الرابط الآمن HTTPS على المنفذ 3000.

### ب. النشر على DigitalOcean / AWS ECS / Render
يمكن إضافة المستودع مباشرة من خلال خيار **App Platform** أو **AWS Copilot** بتحديد:
- **Build Command**: `npm run build`
- **Start Command**: `npm run start` (أو `node dist/server.cjs`)
- **Port**: `3000`

---

## 6. الربط بقاعدة البيانات وتطبيق الهجرات

تعتمد المنظومة على تجميع الاتصالات `pg.Pool` و Drizzle ORM للهجرات المعمارية:

```bash
# تطبيق الهجرات مباشرة من بيئة GitHub CI أو خادم النشر
npx drizzle-kit push
```

---

## 7. التحقق والتفتيش بعد النشر (Post-Deployment Verification)

بعد اكتمال عملية النشر بنجاح:
1. افتح الرابط العام وسجل الدخول بالحساب الإداري.
2. انتقل إلى شاشة **فحص استقرار المعمارية** وأدوات فحص المقاييس الحية (`APM & System Metrics`).
3. تأكد من ظهور حالة الاتصال السليمة للـ `pg.Pool` والوصول السليم للـ Webhooks والمفاتيح.

---
*تمت كتابة وتوثيق هذا الدليل لضمان الامتثال التام لمعايير النشر المؤسسي 100% Ready.*
