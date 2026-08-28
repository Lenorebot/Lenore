// ===================================================
// File: src/utils/logger.js
// الوصف: نظام تسجيل بسيط وموحّد (Console + ملف logs/bot.log)
// ===================================================

const fs = require('fs');
const path = require('path');
const config = require('../config/config');

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const CURRENT_LEVEL = LEVELS[config.logLevel] ?? LEVELS.info;

const logsDir = path.join(process.cwd(), config.paths.logsDir);
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}
const logFile = path.join(logsDir, 'bot.log');

const COLORS = {
    debug: '\x1b[90m',
    info: '\x1b[36m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m',
};

function timestamp() {
    return new Date().toISOString().replace('T', ' ').split('.')[0];
}

function writeToFile(line) {
    // كتابة غير متزامنة لتجنب حجب الحدث الرئيسي
    fs.appendFile(logFile, line + '\n', (err) => {
        if (err) {
            // لا نستخدم logger هنا لتجنب الحلقة اللانهائية عند فشل الكتابة
            console.error('[Logger] فشل الكتابة إلى ملف السجل:', err.message);
        }
    });
}

function log(level, scope, message, meta) {
    if (LEVELS[level] < CURRENT_LEVEL) return;

    const prefix = `[${timestamp()}] [${level.toUpperCase()}] [${scope}]`;
    const line = `${prefix} ${message}${meta ? ' ' + JSON.stringify(meta) : ''}`;

    const color = COLORS[level] || '';
    console.log(`${color}${prefix}${COLORS.reset} ${message}`, meta ? meta : '');

    writeToFile(line);
}

module.exports = {
    debug: (scope, message, meta) => log('debug', scope, message, meta),
    info: (scope, message, meta) => log('info', scope, message, meta),
    warn: (scope, message, meta) => log('warn', scope, message, meta),
    error: (scope, message, meta) => log('error', scope, message, meta),
};
