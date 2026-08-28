// ===================================================
// File: src/handlers/commandHandler.js
// الوصف: تحميل جميع الأوامر (Slash Commands) من مجلد src/commands بشكل تلقائي وتكراري
//        يتم تحميل فقط الملفات التي تُصدّر { data, execute } - أي أن ملفات الأوامر الفرعية
//        التي تُصدّر شكلًا مختلفًا ({ name, register, execute }) يتم تجاهلها هنا تلقائيًا.
// ===================================================

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

function getAllJsFiles(dir) {
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results = results.concat(getAllJsFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            results.push(fullPath);
        }
    }

    return results;
}

/**
 * تحميل جميع الأوامر وربطها بـ client.commands (Collection)
 */
function loadCommands(client) {
    const commandsDir = path.join(process.cwd(), 'src', 'commands');

    if (!fs.existsSync(commandsDir)) {
        logger.warn('CommandHandler', 'مجلد الأوامر غير موجود، سيتم تجاوز التحميل');
        return;
    }

    const files = getAllJsFiles(commandsDir);
    let loaded = 0;

    for (const file of files) {
        try {
            delete require.cache[require.resolve(file)];
            const command = require(file);

            // نتجاهل الملفات التي لا تمثل أمرًا رئيسيًا مكتمل التسجيل (مثل الأوامر الفرعية الداخلية)
            if (!command || !command.data || !command.execute) continue;

            client.commands.set(command.data.name, command);
            loaded++;
        } catch (err) {
            logger.error('CommandHandler', `فشل تحميل ملف الأمر: ${file}`, { error: err.message });
        }
    }

    logger.info('CommandHandler', `تم تحميل ${loaded} أمر/أوامر رئيسية بنجاح`);
}

/**
 * إرجاع مصفوفة بيانات JSON لكل الأوامر (تُستخدم عند تسجيل الأوامر لدى Discord API)
 */
function getCommandsData(client) {
    return [...client.commands.values()].map((cmd) => cmd.data.toJSON());
}

module.exports = { loadCommands, getCommandsData };
