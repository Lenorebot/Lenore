// ===================================================
// File: src/config/config.js
// الوصف: نقطة مركزية لجميع إعدادات المشروع الثابتة
// ===================================================

require('dotenv').config();

module.exports = {
    // بيانات تسجيل الدخول والتشغيل
    token: process.env.BOT_TOKEN,
    clientId: process.env.CLIENT_ID,
    devGuildId: process.env.DEV_GUILD_ID || null,

    // مستوى السجلات
    logLevel: process.env.LOG_LEVEL || 'info',

    // مسارات قاعدة البيانات
    paths: {
        guildsDir: 'data/guilds',
        backupsDir: 'data/backups',
        logsDir: 'logs',
    },

    // إعدادات الكاش (بالمللي ثانية)
    cache: {
        // مدة بقاء إعدادات السيرفر في الذاكرة قبل اعتبارها قديمة (تُحدَّث تلقائيًا عند أي كتابة)
        ttl: 10 * 60 * 1000, // 10 دقائق
        // تأخير تجميع الكتابة (debounce) لتقليل عمليات I/O المتكررة
        writeDebounceMs: 1500,
    },

    // القيم الافتراضية لإعدادات كل سيرفر جديد
    defaultGuildConfig: require('../database/schema').defaultSchema,

    // ألوان افتراضية للـ Embeds
    colors: {
        primary: '#5865F2',
        success: '#57F287',
        danger: '#ED4245',
        warning: '#FEE75C',
        neutral: '#2B2D31',
    },

    // إعدادات الكولداون الافتراضية (بالثواني)
    cooldowns: {
        defaultCommand: 3,
        defaultComponent: 2,
    },

    // الصلاحيات المطلوبة من البوت داخل روم الترحيب/المغادرة
    requiredBotPermissions: [
        'ViewChannel',
        'SendMessages',
        'EmbedLinks',
        'AttachFiles',
    ],
};
