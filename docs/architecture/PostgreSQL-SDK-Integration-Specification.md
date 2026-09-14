# POSTGRESQL SDK & DATABASE INTEGRATION SPECIFICATION
## وثيقة تكامل واختبار SDK قاعدة البيانات PostgreSQL

**Document ID:** `PG-SDK-INTEGRATION-001`  
**Version:** `1.0.0`  
**Status:** `APPROVED & IMPLEMENTED`  
**Architecture:** PostgreSQL Database SDK / Pool Manager / ORM Layer  
**Frontend:** React + TypeScript + Vite  
**Backend:** Node.js + Express + TypeScript Services  
**Database Driver:** `pg` (node-postgres) / Drizzle ORM / Prisma Engine  
**Test Suite Standard:** Unit, Repository Mocking, Transaction Rollback Tests, Connection Pooling  

---

# 1. الهدف والمعمارية الأساسية (Scope & Layer Isolation)

تحدد هذه الوثيقة المعيار الرسمي لتكامل النظام مع قاعدة البيانات 관계ية **PostgreSQL** باستخدام SDK الخاص بـ PostgreSQL ومفاهيم التجميع (Connection Pooling)، ومنع ربط الـ Controllers أو الـ Frontend مباشرةً بستعلامات SQL أو بروابط الاتصال المباشرة:

```text
Frontend (React UI)
   ↓
API Controller (/api/v1/...)
   ↓
Application Service (e.g., UserService, AuditService)
   ↓
Repository Interface (e.g., UserRepository, AuditRepository)
   ↓
PostgreSQL Adapter / ORM (Drizzle / pg Pool)
   ↓
PostgreSQL Engine (Relational DB)
```

---

# 2. إدارة الاتصالات وتجميع الروابط (Connection Pooling & Lifecycle)

1. **Connection Pool Management:**
   - استخدام `pg.Pool` لمنع استنزاف موارد خادم قاعدة البيانات عند تزايد الطلبات المتزامنة.
   - إعداد الحد الأدنى والأقصى للروابط (`min: 2, max: 20`) وزمن الخمول المسموح (`idleTimeoutMillis: 30000`).

2. **التكامل والمعاملات المالية / الحساسة (Transactions & Rollbacks):**
   - ينفذ النظام المعاملات متعددة الخطوات داخل نطاق `BEGIN ... COMMIT / ROLLBACK` لضمان الاتساق الذري (ACID Compliant).

---

# 3. إدارة الأسرار واعتمادات قواعد البيانات (Credentials & Environment Security)

* **الحظر القاطع:** يُمنع كتابة اسم المستخدم، كلمة المرور، أو مسار الاتصال بـ PostgreSQL بالنص الصريح داخل الكود المصدري أو المستندات.
* **التخزين الآمن:** يتم تحميل جميع متغيرات الاتصال حصرياً من البيئة:

```env
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_DB=app_db
POSTGRES_USER=app_user
POSTGRES_PASSWORD=
POSTGRES_SSL=false
POSTGRES_POOL_MAX=20
```

---

# 4. طبقة الاختبارات الخاصة بـ PostgreSQL SDK

1. **Repository Mocking:** إمكانية تشغيل اختبارات الوحدة (Unit Tests) باستخدام محاكاة الـ Repositories في الذاكرة دون فتح اتصال حقيقي بقاعدة البيانات.
2. **Integration & Transaction Rollback Tests:** اختبار استعلامات PostgreSQL الحقيقية داخل معاملات يتم عمل `ROLLBACK` لها تلقائياً في نهاية الاختبار للحفاظ على نظافة البيئة.
3. **Health Check Endpoint:** يوفر الخادم نقطة فحص حية `/api/v1/health/db` لاختبار حالة الاتصال والاستجابة `SELECT 1`.
