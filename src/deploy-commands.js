// ===================================================
// File: src/deploy-commands.js
// الوصف: سكربت مستقل لتسجيل/تحديث الـ Slash Commands لدى Discord API
// طريقة التشغيل: node src/deploy-commands.js
// ===================================================

const { REST, Routes, Collection } = require('discord.js');
const config = require('./config/config');
const logger = require('./utils/logger');
const { loadCommands, getCommandsData } = require('./handlers/commandHandler');

if (!config.token || !config.clientId) {
    logger.error('Deploy', 'يجب ضبط BOT_TOKEN و CLIENT_ID داخل ملف .env قبل تسجيل الأوامر');
    process.exit(1);
}

// عميل وهمي (Mock) فقط لإعادة استخدام دالة loadCommands دون الحاجة لتسجيل دخول كامل
const fakeClient = { commands: new Collection() };
loadCommands(fakeClient);

const commandsData = getCommandsData(fakeClient);
const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        logger.info('Deploy', `جارِ تسجيل ${commandsData.length} أمر/أوامر...`);

        if (config.devGuildId) {
            // تسجيل فوري على سيرفر تجريبي واحد (مفيد أثناء التطوير)
            await rest.put(Routes.applicationGuildCommands(config.clientId, config.devGuildId), {
                body: commandsData,
            });
            logger.info('Deploy', `تم تسجيل الأوامر بنجاح على سيرفر التطوير (${config.devGuildId})`);
        } else {
            // تسجيل عالمي (قد يستغرق حتى ساعة للظهور على كل السيرفرات)
            await rest.put(Routes.applicationCommands(config.clientId), { body: commandsData });
            logger.info('Deploy', 'تم تسجيل الأوامر عالميًا بنجاح (قد يستغرق ظهورها حتى ساعة)');
        }
    } catch (error) {
        logger.error('Deploy', 'فشل تسجيل الأوامر', { error: error.message });
        process.exit(1);
    }
})();
