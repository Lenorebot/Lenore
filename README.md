# 🎉 نظام الترحيب والمغادرة الاحترافي - Discord.js

نظام Welcome/Goodbye متكامل، Modular، وقابل للتطوير، مبني بـ **Discord.js v14** و **Node.js** مع قاعدة بيانات **JSON محلية** فقط (بدون MongoDB أو أي خدمة خارجية).

---

## 📁 هيكل المشروع

```
discord-welcome-bot/
├── index.js                        # نقطة تشغيل البوت
├── package.json
├── .env.example                    # نموذج ملف الإعدادات السرية
├── data/
│   ├── guilds/                     # ملف JSON مستقل لكل سيرفر
│   └── backups/                    # نسخ احتياطية تلقائية
├── logs/                           # سجلات التشغيل والأخطاء
└── src/
    ├── config/config.js            # الإعدادات الثابتة والألوان والكولداون
    ├── database/
    │   ├── schema.js                # الهيكل الافتراضي لإعدادات كل سيرفر
    │   └── DatabaseManager.js       # القراءة/الكتابة/الكاش/النسخ الاحتياطي
    ├── systems/welcome/
    │   ├── welcome.js               # منطق إرسال رسالة الترحيب
    │   ├── goodbye.js                # منطق إرسال رسالة المغادرة
    │   ├── messageBuilder.js         # بناء Embed أو رسالة نصية
    │   └── variables.js              # محرك المتغيرات {user} {server} ...
    ├── commands/welcome/
    │   ├── index.js                  # الأمر الرئيسي /welcome (يجمع كل الفروع)
    │   ├── setup.js  config.js  enable.js  disable.js
    │   └── test.js  preview.js  reset.js  variables.js
    ├── components/
    │   ├── panelBuilder.js           # بناء لوحة الإعداد التفاعلية
    │   ├── panelHandler.js           # منطق الأزرار/القوائم/الـModals
    │   └── modalBuilder.js           # نوافذ تعديل الرسائل
    ├── events/
    │   ├── ready.js
    │   ├── guildMemberAdd.js
    │   ├── guildMemberRemove.js
    │   └── interactionCreate.js
    ├── handlers/
    │   ├── commandHandler.js         # تحميل الأوامر تلقائيًا
    │   ├── eventHandler.js           # تحميل الأحداث تلقائيًا
    │   ├── componentHandler.js       # توجيه تفاعلات الأزرار/القوائم
    │   └── errorHandler.js           # معالجة شاملة للأخطاء
    ├── deploy-commands.js            # تسجيل Slash Commands لدى Discord
    └── utils/
        ├── logger.js
        ├── permissions.js
        └── cooldown.js
```

---

## 1️⃣ تثبيت Node.js

- حمّل النسخة **LTS** (18 أو أحدث) من الموقع الرسمي: https://nodejs.org
- تأكد من نجاح التثبيت:
```bash
node -v
npm -v
```

## 2️⃣ تثبيت الاعتماديات (Dependencies)

داخل مجلد المشروع:
```bash
npm install
```
سيقوم هذا بتثبيت `discord.js` و `dotenv`.

## 3️⃣ إعداد Bot Token و Client ID

1. اذهب إلى https://discord.com/developers/applications
2. أنشئ تطبيقًا جديدًا (New Application).
3. من تبويب **Bot**: اضغط **Reset Token** وانسخ التوكن (لا تشاركه مع أي أحد).
4. من تبويب **General Information**: انسخ **Application ID** (هذا هو `CLIENT_ID`).
5. من تبويب **Bot**، فعّل الصلاحيات التالية تحت **Privileged Gateway Intents**:
   - `SERVER MEMBERS INTENT` ✅ (ضروري لعمل نظام الترحيب/المغادرة)

انسخ ملف `.env.example` وأعد تسميته إلى `.env` ثم املأ القيم:

```env
BOT_TOKEN=التوكن_الخاص_بك
CLIENT_ID=معرف_التطبيق
DEV_GUILD_ID=معرف_سيرفر_التجربة   # اختياري
```

## 4️⃣ دعوة البوت للسيرفر

من تبويب **OAuth2 -> URL Generator**:
- Scopes: `bot` و `applications.commands`
- Permissions: `Send Messages`, `Embed Links`, `View Channels`, `Attach Files`

افتح الرابط الناتج وادعُ البوت لسيرفرك.

## 5️⃣ تسجيل Slash Commands

```bash
node src/deploy-commands.js
```
- إذا حددت `DEV_GUILD_ID` في `.env` سيتم التسجيل فورًا على ذلك السيرفر فقط (مثالي للتطوير).
- إذا تركته فارغًا سيتم التسجيل عالميًا (قد يستغرق ظهور الأوامر حتى ساعة).

## 6️⃣ تشغيل البوت

```bash
npm start
```
أو للتطوير مع إعادة تشغيل تلقائية عند أي تعديل:
```bash
npm run dev
```

---

## ⚙️ كيفية إعداد نظام الترحيب

**الطريقة السريعة:**
```
/welcome setup النظام:الترحيب الروم:#welcome
```

**الطريقة الكاملة (لوحة تفاعلية):**
```
/welcome config
```
ستظهر لوحة بها:
- أزرار تفعيل/إيقاف الترحيب والمغادرة
- قوائم اختيار الرومات
- أزرار تعديل الرسالة (تفتح نافذة Modal لتعديل العنوان/الوصف/اللون/الفوتر/الصورة)
- قائمة لتبديل خيارات مثل: المنشن، وضع Embed، الصورة المصغرة
- زر معاينة فورية
- زر إعادة تعيين (مع تأكيد)

## 🧪 كيفية اختبار النظام

```
/welcome test النظام:الترحيب
```
يرسل رسالة اختبار حقيقية داخل الروم المحدد باستخدام بياناتك أنت كعضو.

للمعاينة الخاصة بدون نشر أي شيء في السيرفر:
```
/welcome preview النظام:الترحيب
```

## 🔤 المتغيرات المتاحة

استخدم `/welcome variables` لعرض القائمة الكاملة داخل ديسكورد، أو راجع الجدول:

| المتغير | الوصف |
|---|---|
| `{user}` / `{mention}` | منشن العضو |
| `{username}` | اسم المستخدم |
| `{displayName}` | الاسم الظاهر في السيرفر |
| `{userid}` | معرف العضو |
| `{server}` | اسم السيرفر |
| `{serverid}` | معرف السيرفر |
| `{memberCount}` | عدد الأعضاء الحالي |
| `{joinedAt}` | تاريخ الانضمام |
| `{accountCreated}` | تاريخ إنشاء الحساب |
| `{avatar}` | رابط صورة العضو |

لإضافة متغير جديد مستقبلًا: افتح `src/systems/welcome/variables.js` وأضف سطرًا واحدًا عبر `registerVariable(key, description, resolveFn)`.

---

## 🧩 إضافة النظام إلى مشروع بوت موجود لديك

1. انسخ مجلد `src/systems/welcome`, `src/database`, `src/components`, والملفات المرتبطة بهما إلى مشروعك.
2. تأكد أن `client.commands` عبارة عن `Collection`، وأضف أمر `welcome` من `src/commands/welcome/index.js` إليها.
3. تأكد من تفعيل `GatewayIntentBits.GuildMembers` في تعريف الـ Client.
4. أضف استدعاء `handleWelcome(member)` و `handleGoodbye(member)` داخل أحداث `guildMemberAdd` و `guildMemberRemove` الموجودة لديك (أو انسخ ملفات `src/events` كما هي).
5. مرّر تفاعلات الأزرار/القوائم/الـModals التي تبدأ بـ `wl:` إلى `routeComponent()` من `src/handlers/componentHandler.js` داخل معالج `interactionCreate` الخاص بك.
6. شغّل `node src/deploy-commands.js` لتسجيل الأمر الجديد.

النظام مصمم ليكون **مستقلًا (Self-contained)** قدر الإمكان: كل شيء خاص به داخل `systems/welcome`, `commands/welcome`, و`components/` بحذر من التعارض مع أي أنظمة أخرى (إدارة، نقاط، تذاكر...) قد تضيفها لاحقًا لنفس المشروع.

---

## 🛡️ ملاحظات تقنية مهمة

- **الصلاحيات:** الأمر `/welcome` مقيّد بصلاحية `Manage Server` أو `Administrator` (على مستوى Discord نفسه عبر `setDefaultMemberPermissions`، وأيضًا برمجيًا كطبقة حماية ثانية).
- **الأداء:** الكتابة على ملفات JSON مؤجلة (Debounced) لمدة 1.5 ثانية لتقليل عمليات القرص، والقراءة تعتمد على كاش في الذاكرة.
- **الأمان من فقدان البيانات:** الكتابة تتم عبر ملف مؤقت `.tmp` ثم إعادة تسمية ذرّية (Atomic Rename)، والملفات التالفة يتم اكتشافها ونسخها احتياطيًا تلقائيًا بدل حذفها.
- **الاستقرار:** جميع الأخطاء (أوامر / تفاعلات / قاعدة بيانات / Discord API) تُلتقط ولا توقف تشغيل البوت، وتُسجَّل في `logs/bot.log`.
- **التوسعة المستقبلية:** لإضافة نظام جديد (إدارة، نقاط، تذاكر...) أنشئ مجلدًا مشابهًا داخل `src/systems/` و`src/commands/` بنفس النمط.
