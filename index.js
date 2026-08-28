// ===================================================
// File: index.js
// الوصف: نقطة تشغيل البوت الرئيسية مع رفع الأوامر تلقائياً
// ===================================================

const { Client, GatewayIntentBits, Partials, Collection, REST, Routes } = require('discord.js');
const config = require('./src/config/config');
const logger = require('./src/utils/logger');
const { loadCommands } = require('./src/handlers/commandHandler');
const { loadEvents } = require('./src/handlers/eventHandler');
const { registerGlobalHandlers } = require('./src/handlers/errorHandler');

// التحقق من وجود البيانات الأساسية قبل التشغيل
if (!config.token || config.token === 'YOUR_BOT_TOKEN_HERE') {
    logger.error('Bootstrap', 'BOT_TOKEN غير موجود في ملف .env - يرجى إضافته قبل تشغيل البوت');
    process.exit(1);
}

if (!config.clientId || config.clientId === 'YOUR_CLIENT_ID_HERE') {
    logger.error('Bootstrap', 'CLIENT_ID غير موجود في ملف .env - يرجى إضافته قبل تشغيل البوت');
    process.exit(1);
}

// تفعيل معالج الأخطاء العام أولًا
registerGlobalHandlers();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.GuildMember, Partials.User],
});

client.commands = new Collection();

// 1. تحميل الأوامر والأحداث إلى الذاكرة
loadCommands(client);
loadEvents(client);

// 2. رفع أوامر Slash تلقائياً إلى ديسكورد عند التشغيل
const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        const commandsData = Array.from(client.commands.values()).map(cmd => cmd.data.toJSON());
        
        logger.info('Bootstrap', `جاري تسجيل ${commandsData.length} أمر (Slash) لدى ديسكورد...`);

        // تسجيل الأوامر عامة على مستوى جميع السيرفرات
        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commandsData }
        );

        logger.info('Bootstrap', '✅ تم تسجيل وقبول الأوامر من ديسكورد بنجاح!');
    } catch (error) {
        logger.error('Bootstrap', 'فشل تسجيل أوامر Slash', { error: error.message });
    }
})();

// 3. تسجيل الدخول
client.login(config.token).catch((err) => {
    logger.error('Bootstrap', 'فشل تسجيل الدخول - تحقق من صحة BOT_TOKEN', { error: err.message });
    process.exit(1);
});

module.exports = client;