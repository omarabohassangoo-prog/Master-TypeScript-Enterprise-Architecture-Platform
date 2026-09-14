# MASTER SDK INTEGRATION & TESTING SPECIFICATION
## وثيقة تكامل واختبار SDK — Email / SMS / WhatsApp / PayPal

**Document ID:** `SDK-INTEGRATION-AND-TESTING-001`  
**Version:** `1.0.0`  
**Status:** `APPROVED & IMPLEMENTED`  
**Architecture:** Provider-Agnostic Adapter Pattern  
**Frontend:** React + TypeScript + Vite  
**Backend:** Node.js + Express + TypeScript Services  
**Integrations Covered:** Email (SMTP/SendGrid), SMS (Twilio/Unifonic), WhatsApp Cloud API, PayPal Sandbox Gateway  
**Test Suite Standard:** Unit, Contract, Mock Providers, Integration & Webhook Verification  

---

# 1. الغرض والمعمارية الأساسية (Scope & Layer Isolation)

تحدد هذه الوثيقة المعيار الرسمي لتكامل النظام مع خدمات الطرف الثالث مع منع ربط الـ Frontend أو الـ Controllers مباشرة بأي SDK خارجي:

```text
Frontend (React UI)
   ↓
API Controller (/api/v1/...)
   ↓
Application Service (e.g., PaymentService, NotificationService)
   ↓
Provider Interface (e.g., PaymentProvider, EmailProvider)
   ↓
Provider Adapter (e.g., PayPalAdapter, SendGridAdapter, TwilioAdapter)
   ↓
External SDK / REST API (External Service / Sandbox)
```

---

# 2. مبدأ عدم التبعية لمزود مخصص (Provider Agnostic)

جميع الخدمات في النظام تعتمد على واجهات برمجية مجردة (Interfaces)، مما يسمح بتبديل المزود الخارجي (مثل التبديل من SendGrid إلى AWS SES أو Mailgun) دون تعديل سطر واحد في منطق العمليات (Application Logic):

```typescript
export interface EmailProvider {
  send(message: EmailMessage): Promise<EmailResult>;
  verifyConnection(): Promise<ProviderHealth>;
}

export interface PaymentProvider {
  createOrder(request: CreatePaymentRequest): Promise<CreatePaymentResult>;
  captureOrder(orderId: string): Promise<CapturePaymentResult>;
  verifyWebhook(payload: unknown, headers: Record<string, string>): Promise<WebhookVerificationResult>;
}
```

---

# 3. إدارة الاعتمادات والأسرار (Credentials & Environment Security)

* **القاعدة القاطعة:** يُحظر حظراً تاماً تضمين مفاتيح API Keys أو Client Secrets أو Webhook Secrets أو كلمة مرور SMTP في الكود المصدري أو ملفات Git أو قاعدة البيانات بالنص الصريح.
* **التخزين الآمن:** يتم تحميل جميع الأسرار حصرياً من متغيرات البيئة (`.env`) أو مشغل إدارة الأسرار (Secret Manager):

```env
EMAIL_API_KEY=
SMS_API_KEY=
SMS_API_SECRET=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WEBHOOK_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_ENVIRONMENT=sandbox
```

---

# 4. معالجة الفشل، الإعادة، وتكرار العمليات (Resilience, Retry & Idempotency)

1. **Retry Policy:** يطبق النظام إعادة المحاولة التلقائية (Exponential Backoff) فقط على أخطاء الشبكة المؤقتة وحالات `429 Rate Limit` و `5xx Server Error`، بينما يُحظر إعادة المحاولة في حالات الأخطاء الناجمة عن الاعتمادات الخاطئة (`401/403`) أو البيانات المدخلة الخاطئة (`400`).
2. **Idempotency (منع التكرار المالي والرسائل):** تحتوي كل عملية مدفوعات وإرسال رسائل على مفتاح فريد `idempotency_key` يتم حفظه في قاعدة البيانات لتجنب الازدواجية والتحصيل المضاعف.
3. **Webhook Verification:** لا تعتبر المعاملة المالية أو حالة التسليم معتمدة لمجرد استلام تأكيد من الواجهة الأمامية (Frontend)؛ بل يلزم التحقق من توقيع الـ Webhook مباشرة مع خوادم PayPal / WhatsApp المعتمدة.

---

# 5. لوحة اختبار وتكامل الـ SDK الإدارية (SDK Testbench & Mock Suite)

يوفر النظام لوحة التحكم الإدارية `/admin/communications` و `/admin/paypal` التي تتيح للفرق الفنية:
* **فحص الاتصال (Connection Health Checks)**: اختبار صلاحية الاعتمادات وسرعة الاستجابة (Latency) لكل مزود.
* **إرسال رسائل ومعاملات تجريبية (Sandbox Testing)**: إرسال بريد، SMS، رسائل واتساب، وإنشاء شحنات دفع عبر PayPal Sandbox دون أخطار على البيئة المباشرة.
* **مزودات الاختبار المستقلة (Mock Providers)**: دعم تشغيل النظام واختباره بالكامل أوفلاين في بيئة CI/CD دون الحاجة لاتصال بالإنترنت.

---

# 6. مصفوفة الاختبارات المعيارية (SDK Testing Matrix)

| نوع الاختبار | Email | SMS | WhatsApp | PayPal |
| :--- | :---: | :---: | :---: | :---: |
| **Connection & Auth Check** | ✓ | ✓ | ✓ | ✓ |
| **Mock Provider Unit Tests** | ✓ | ✓ | ✓ | ✓ |
| **Validation & Schema Contract**| ✓ | ✓ | ✓ | ✓ |
| **Timeout & Retry Policy** | ✓ | ✓ | ✓ | ✓ |
| **Idempotency Protection** | ✓ | ✓ | ✓ | ✓ |
| **Webhook Verification & Audit**| — | اختياري | ✓ | ✓ |
| **Sandbox Environment Support** | ✓ | ✓ | ✓ | ✓ |
