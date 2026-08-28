// ===================================================
// File: src/events/ready.js
// الوصف: يُنفَّذ مرة واحدة عند نجاح تسجيل دخول البوت
// ===================================================

const { ActivityType } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    name: 'ready',
    once: true,

    async execute(client) {
        logger.info('Ready', `تم تسجيل الدخول بنجاح باسم ${client.user.tag}`);
        logger.info('Ready', `البوت يعمل حاليًا في ${client.guilds.cache.size} سيرفر`);

        client.user.setPresence({
            activities: [{ name: `${client.guilds.cache.size} سيرفر | /welcome config`, type: ActivityType.Watching }],
            status: 'online',
        });
    },
};
