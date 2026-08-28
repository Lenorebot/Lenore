// ===================================================
// File: src/handlers/eventHandler.js
// الوصف: تحميل جميع ملفات الأحداث من مجلد src/events تلقائيًا
// ===================================================

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

function loadEvents(client) {
    const eventsDir = path.join(process.cwd(), 'src', 'events');

    if (!fs.existsSync(eventsDir)) {
        logger.warn('EventHandler', 'مجلد الأحداث غير موجود، سيتم تجاوز التحميل');
        return;
    }

    const files = fs.readdirSync(eventsDir).filter((f) => f.endsWith('.js'));
    let loaded = 0;

    for (const file of files) {
        try {
            const filePath = path.join(eventsDir, file);
            delete require.cache[require.resolve(filePath)];
            const event = require(filePath);

            if (!event || !event.name || !event.execute) {
                logger.warn('EventHandler', `تم تجاوز ملف حدث غير صالح: ${file}`);
                continue;
            }

            if (event.once) {
                client.once(event.name, (...args) => event.execute(client, ...args));
            } else {
                client.on(event.name, (...args) => event.execute(client, ...args));
            }

            loaded++;
        } catch (err) {
            logger.error('EventHandler', `فشل تحميل ملف الحدث: ${file}`, { error: err.message });
        }
    }

    logger.info('EventHandler', `تم تحميل ${loaded} حدث/أحداث بنجاح`);
}

module.exports = { loadEvents };
