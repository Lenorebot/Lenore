// ===================================================
// File: src/systems/welcome/variables.js
// الوصف: محرك المتغيرات (Variables Engine) - يستبدل {variable} داخل النصوص
//        مصمم ليكون قابلًا للتوسعة بسهولة عبر registerVariable()
// ===================================================

/**
 * كل متغير عبارة عن: { key, description, resolve(member) }
 * resolve تستقبل عضو Discord (GuildMember) وترجع نصًا.
 */
const registry = new Map();

function registerVariable(key, description, resolve) {
    registry.set(key, { key, description, resolve });
}

function formatDate(date) {
    if (!date) return 'غير معروف';
    return new Date(date).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// ==== تسجيل المتغيرات الأساسية ====

registerVariable('user', 'منشن العضو', (member) => `<@${member.id}>`);
registerVariable('mention', 'منشن العضو (مطابق لـ user)', (member) => `<@${member.id}>`);
registerVariable('username', 'اسم العضو (Username)', (member) => member.user.username);
registerVariable('displayName', 'الاسم المعروض في السيرفر', (member) => member.displayName || member.user.username);
registerVariable('userid', 'معرف العضو', (member) => member.id);
registerVariable('server', 'اسم السيرفر', (member) => member.guild.name);
registerVariable('serverid', 'معرف السيرفر', (member) => member.guild.id);
registerVariable('memberCount', 'عدد أعضاء السيرفر الحالي', (member) => member.guild.memberCount.toLocaleString('en-US'));
registerVariable('joinedAt', 'تاريخ دخول العضو للسيرفر', (member) => formatDate(member.joinedAt));
registerVariable('accountCreated', 'تاريخ إنشاء حساب Discord', (member) => formatDate(member.user.createdAt));
registerVariable('avatar', 'رابط صورة العضو', (member) => member.user.displayAvatarURL({ extension: 'png', size: 512 }));

/**
 * استبدال كل المتغيرات الموجودة داخل نص معيّن بقيمها الفعلية لعضو محدد.
 * أي متغير غير معروف أو فشل في التنفيذ يُترك كما هو بدون كسر بقية النص.
 */
function resolveVariables(text, member) {
    if (!text || typeof text !== 'string') return text;

    return text.replace(/\{([a-zA-Z]+)\}/g, (match, key) => {
        const variable = registry.get(key);
        if (!variable) return match;

        try {
            return variable.resolve(member) ?? match;
        } catch {
            return match;
        }
    });
}

/**
 * إرجاع قائمة بجميع المتغيرات المسجلة (تُستخدم في أمر /welcome variables)
 */
function listVariables() {
    return Array.from(registry.values()).map(({ key, description }) => ({ key, description }));
}

module.exports = { registerVariable, resolveVariables, listVariables };
