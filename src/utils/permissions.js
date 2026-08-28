// ===================================================
// File: src/utils/permissions.js
// الوصف: أدوات التحقق من صلاحيات المستخدم والبوت
// ===================================================

const { PermissionFlagsBits } = require('discord.js');
const config = require('../config/config');

/**
 * هل العضو يملك صلاحية إدارة النظام (Administrator أو Manage Guild)؟
 */
function canManageSystem(member) {
    if (!member) return false;
    return (
        member.permissions.has(PermissionFlagsBits.Administrator) ||
        member.permissions.has(PermissionFlagsBits.ManageGuild)
    );
}

/**
 * التحقق من أن البوت يملك الصلاحيات المطلوبة داخل روم معيّن.
 * يرجع { ok: boolean, missing: string[] }
 */
function checkBotChannelPermissions(channel, guildMe) {
    const missing = [];
    if (!channel || !guildMe) {
        return { ok: false, missing: ['Unknown'] };
    }

    const perms = channel.permissionsFor(guildMe);
    if (!perms) return { ok: false, missing: ['Unknown'] };

    const map = {
        ViewChannel: PermissionFlagsBits.ViewChannel,
        SendMessages: PermissionFlagsBits.SendMessages,
        EmbedLinks: PermissionFlagsBits.EmbedLinks,
        AttachFiles: PermissionFlagsBits.AttachFiles,
    };

    for (const name of config.requiredBotPermissions) {
        const flag = map[name];
        if (flag && !perms.has(flag)) {
            missing.push(name);
        }
    }

    return { ok: missing.length === 0, missing };
}

module.exports = { canManageSystem, checkBotChannelPermissions };
