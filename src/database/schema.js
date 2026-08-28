// ===================================================
// File: src/database/schema.js
// الوصف: الهيكل الافتراضي لملف إعدادات كل سيرفر (Deep-cloned عند الإنشاء)
// ===================================================

const defaultSchema = {
    guildId: null,
    createdAt: null,
    updatedAt: null,

    welcome: {
        enabled: false,
        channelId: null,
        mention: true,
        useEmbed: true,
        message: {
            // تستخدم عند useEmbed = false (رسالة نصية عادية)
            content: 'مرحبًا {mention} بك في **{server}**! 🎉',
            // تستخدم عند useEmbed = true
            title: '🎉 عضو جديد!',
            description: 'أهلًا بك {username} في **{server}**\nأنت العضو رقم **#{memberCount}**',
            color: '#5865F2',
            authorEnabled: true,
            authorText: '{username}',
            authorIconFromAvatar: true,
            thumbnailEnabled: true,
            thumbnailFromAvatar: true,
            thumbnailUrl: null,
            imageEnabled: false,
            imageUrl: null,
            footerEnabled: true,
            footerText: 'انضم في {joinedAt}',
            footerIconFromAvatar: true,
            timestampEnabled: true,
        },
    },

    goodbye: {
        enabled: false,
        channelId: null,
        useEmbed: true,
        message: {
            content: '👋 غادر **{username}** السيرفر.',
            title: '👋 وداعًا',
            description: '**{username}** لم يعد معنا.\nعدد الأعضاء الحالي: **#{memberCount}**',
            color: '#ED4245',
            authorEnabled: true,
            authorText: '{username}',
            authorIconFromAvatar: true,
            thumbnailEnabled: true,
            thumbnailFromAvatar: true,
            thumbnailUrl: null,
            imageEnabled: false,
            imageUrl: null,
            footerEnabled: true,
            footerText: 'كان معنا منذ {joinedAt}',
            footerIconFromAvatar: true,
            timestampEnabled: true,
        },
    },
};

/**
 * إرجاع نسخة عميقة (Deep Clone) من الهيكل الافتراضي حتى لا يتم تعديل
 * الكائن الأصلي بالمرجع عند إنشاء إعدادات سيرفر جديد.
 */
function cloneDefaultSchema(guildId) {
    const clone = JSON.parse(JSON.stringify(defaultSchema));
    clone.guildId = guildId;
    clone.createdAt = new Date().toISOString();
    clone.updatedAt = new Date().toISOString();
    return clone;
}

module.exports = { defaultSchema, cloneDefaultSchema };
