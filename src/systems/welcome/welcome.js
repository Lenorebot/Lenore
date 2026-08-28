// ===================================================
// File: src/systems/welcome/welcome.js
// الوصف: منطق نظام الترحيب - يُستدعى من حدث guildMemberAdd
// ===================================================

const db = require('../../database/DatabaseManager');
const logger = require('../../utils/logger');
const { buildMessagePayload } = require('./messageBuilder');
const { checkBotChannelPermissions } = require('../../utils/permissions');

/**
 * تنفيذ نظام الترحيب لعضو معيّن.
 * @param {import('discord.js').GuildMember} member
 */
async function handleWelcome(member) {
    try {
        const guildConfig = db.getGuildConfig(member.guild.id);
        const welcome = guildConfig.welcome;

        if (!welcome.enabled || !welcome.channelId) return;

        const channel = member.guild.channels.cache.get(welcome.channelId);
        if (!channel) {
            logger.warn('Welcome', `روم الترحيب غير موجود في السيرفر ${member.guild.id}`);
            return;
        }

        const guildMe = member.guild.members.me;
        const permCheck = checkBotChannelPermissions(channel, guildMe);
        if (!permCheck.ok) {
            logger.warn('Welcome', `صلاحيات ناقصة في روم الترحيب (${channel.id})`, { missing: permCheck.missing });
            return;
        }

        const payload = buildMessagePayload(welcome.message, member, welcome.useEmbed, welcome.mention);
        await channel.send(payload);

        logger.info('Welcome', `تم إرسال رسالة ترحيب للعضو ${member.user.tag} في ${member.guild.name}`);
    } catch (err) {
        logger.error('Welcome', 'فشل تنفيذ نظام الترحيب', { error: err.message, guild: member.guild?.id });
    }
}

module.exports = { handleWelcome };
