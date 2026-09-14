# MASTER SYSTEM & USER SETTINGS SPECIFICATION
## وثيقة إعدادات النظام وإعدادات المستخدم والملف الشخصي

**Document ID:** `SYSTEM-USER-SETTINGS-001`  
**Version:** `1.0.0`  
**Status:** `APPROVED & IMPLEMENTED`  
**Architecture:** Full-Stack TypeScript Enterprise  
**Frontend:** React + TypeScript + Vite  
**Backend:** Node.js + TypeScript (Express)  
**Database:** PostgreSQL (3NF Schema)  
**Cache:** Distributed Redis / In-Memory Cache  
**API Standard:** REST / OpenAPI 3.1  
**Security:** RBAC + Strict Permission-Based Authorization  
**UI Engine:** Arabic RTL / LTR Responsive Engine  

---

# 1. الغرض والمبادئ الأساسية (Scope & Principles)

تحدد هذه الوثيقة الفصل المعماري والترابط الوظيفي بين مستويين من الإعدادات:

```text
┌────────────────────────────────────────────────────────┐
│               SYSTEM SETTINGS (Global)                 │
│      إعدادات النظام العامة - تحكم إداري شامل           │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
          تحدد سياسات الحماية وحدود الإمكانات
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│            USER SETTINGS & PROFILE (Personal)          │
│      إعدادات المستخدم والملف الشخصي - تفضيلات خاصة    │
└────────────────────────────────────────────────────────┘
```

> **القاعدة الحاكمة (Resolution Rule):**  
> إعداد المستخدم لا يستطيع بأي حال من الأحوال تجاوز إعداد أمني أو سياسة إلزامية على مستوى النظام (`System Security Policy > User Preference`).

---

# 2. مصادر الإعدادات وعزل الأسرار (Settings Sources & Secret Isolation)

```text
Environment Variables (الأسرار ومفاتيح التشفير)
        +
Database Settings (الإعدادات الديناميكية القابلة للتعديل من الإدارة)
        +
Static JSON Configuration (الإعدادات الأولية وMetadata)
```

### الأسرار المحظورة من التخزين في قاعدة البيانات أو الواجهة:
* `DATABASE_PASSWORD`
* `JWT_SECRET`
* `PAYPAL_CLIENT_SECRET`
* `SMTP_PASSWORD`
* `API_KEYS`

---

# 3. محرك حل الإعدادات (Settings Resolver Architecture)

```text
Environment
     ↓
System Setting (DB)
     ↓
User Setting (Profile/Preferences)
     ↓
Runtime Value (UI & Backend Execution)
```

---

# 4. مصفوفة مقارنة إعدادات النظام وإعدادات المستخدم

| الإعداد | مستوى النظام (System) | مستوى المستخدم (User) | الصلاحية المطلوبة |
| :--- | :---: | :---: | :--- |
| **اسم النظام والوصف** | ✓ | — | `settings.update` |
| **اللغة الافتراضية** | ✓ (Default) | ✓ (Override) | `settings.update` / `profile.update.self` |
| **المنطقة الزمنية** | ✓ (Default) | ✓ (Override) | `settings.update` / `profile.update.self` |
| **المظهر (Theme / Dark Mode)**| ✓ (Default) | ✓ (Override) | `settings.update` / `profile.update.self` |
| **إلزامية التحقق الثنائي MFA**| ✓ (Policy) | — (Strict) | `settings.security` |
| **تفعيل التحقق الثنائي MFA** | — | ✓ (User Level) | `profile.security.self` |
| **مهلة الجلسة (Session Timeout)**| ✓ | — | `settings.security` |
| **قنوات الإشعارات (Email/SMS/WA)**| ✓ (Enabler) | ✓ (Subscriber) | `settings.notifications` / `preferences.update.self` |
| **الحد الأقصى لحجم الملفات** | ✓ | — | `settings.files` |
| **الملف الشخصي والصورة** | — | ✓ | `profile.update.self` |
| **سجل الجلسات النشطة** | ✓ (Global Audit) | ✓ (Own Devices) | `audit.read` / `sessions.read.self` |

---

# 5. واجهات البرمجة الموحدة (REST Endpoints)

### نقاط إعدادات النظام الإدارية:
* `GET /api/v1/admin/settings` - استعراض كافة الإعدادات
* `PUT /api/v1/admin/settings/:key` - تعديل إعداد مخصص
* `GET /api/v1/config/public` - استرجاع الإعدادات العامة الآمنة للواجهة

### نقاط إعدادات المستخدم والملف الشخصي:
* `GET /api/v1/profile` - استرجاع بيانات الملف الشخصي
* `PUT /api/v1/profile` - تحديث بيانات المستخدم
* `GET /api/v1/profile/preferences` - استرجاع التفضيلات
* `PUT /api/v1/profile/preferences` - تحديث التفضيلات الشخصية
* `POST /api/v1/profile/security/change-password` - تغيير كلمة المرور بأمان

---

# 6. ضوابط التحقق وحفظ سجلات التدقيق (Validation & Audit Trail)

1. كل تعديل على إعدادات النظام يسجل في جدول `audit_logs` مع ذكر الفاعل، القيمة السابقة، القيمة الجديدة، عنوان IP وبصمة المتصفح.
2. يتم فحص القيم المحدثة وفق schemas صارمة لمنع التكوينات الخاطئة.
3. تفريغ التخزين المؤقت (Cache Invalidation) فور تعديل أي إعداد لضمان اتساق كافة العمليات الفورية.
