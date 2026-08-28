// ===================================================
// File: src/utils/cooldown.js
// الوصف: نظام Cooldown بسيط لمنع الاستخدام المتكرر للأوامر والتفاعلات
// ===================================================

const config = require('../config/config');

/** @type {Map<string, number>} key = `${scope}:${userId}` -> timestamp انتهاء الكولداون */
const activeCooldowns = new Map();

/**
 * التحقق من الكولداون. يرجع 0 إذا كان مسموحًا بالتنفيذ،
 * أو عدد الثواني المتبقية إذا كان المستخدم لا يزال ضمن فترة الانتظار.
 */
function checkCooldown(scope, userId, seconds = config.cooldowns.defaultCommand) {
    const key = `${scope}:${userId}`;
    const now = Date.now();
    const expiresAt = activeCooldowns.get(key);

    if (expiresAt && expiresAt > now) {
        return Math.ceil((expiresAt - now) / 1000);
    }

    activeCooldowns.set(key, now + seconds * 1000);

    // تنظيف تلقائي بعد انتهاء الكولداون لتجنب تراكم الذاكرة
    setTimeout(() => {
        if (activeCooldowns.get(key) <= Date.now()) {
            activeCooldowns.delete(key);
        }
    }, seconds * 1000 + 1000).unref?.();

    return 0;
}

module.exports = { checkCooldown };
