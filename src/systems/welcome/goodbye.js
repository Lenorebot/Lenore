// ===================================================
// File: src/systems/welcome/goodbye.js
// الوصف: منطق نظام المغادرة - يُستدعى من حدث guildMemberRemove
// ===================================================

const db = require('../../database/DatabaseManager');
const logger = require('../../utils/logger');
const { buildMessagePayload } = require('./messageBuilder');
const { checkBotChannelPermissions } = require('../../utils/permissions');

/**
 * تنفيذ نظام المغادرة لعضو معيّن.
 * @param {import('discord.js').GuildMember} member
 */
async function handleGoodbye(member) {
    try {
        const guildConfig = db.getGuildConfig(member.guild.id);
        const goodbye = guildConfig.goodbye;

        if (!goodbye.enabled || !goodbye.channelId) return;

        const channel = member.guild.channels.cache.get(goodbye.channelId);
        if (!channel) {
            logger.warn('Goodbye', `روم المغادرة غير موجود في السيرفر ${member.guild.id}`);
            return;
        }

        const guildMe = member.guild.members.me;
        const permCheck = checkBotChannelPermissions(channel, guildMe);
        if (!permCheck.ok) {
            logger.warn('Goodbye', `صلاحيات ناقصة في روم المغادرة (${channel.id})`, { missing: permCheck.missing });
            return;
        }

        // نظام المغادرة لا يدعم Mention لأن العضو غادر بالفعل
        const payload = buildMessagePayload(goodbye.message, member, goodbye.useEmbed, false);
        await channel.send(payload);

        logger.info('Goodbye', `تم إرسال رسالة مغادرة للعضو ${member.user.tag} في ${member.guild.name}`);
    } catch (err) {
        logger.error('Goodbye', 'فشل تنفيذ نظام المغادرة', { error: err.message, guild: member.guild?.id });
    }
}

module.exports = { handleGoodbye };
