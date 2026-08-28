// ===================================================
// File: src/systems/welcome/messageBuilder.js
// الوصف: يبني رسالة (Embed أو نص عادي) بناءً على إعدادات المستخدم + متغيرات العضو
// ===================================================

const { EmbedBuilder } = require('discord.js');
const { resolveVariables } = require('./variables');
const logger = require('../../utils/logger');

const VALID_HEX = /^#([0-9A-Fa-f]{6})$/;

function safeColor(color) {
    return VALID_HEX.test(color || '') ? color : '#5865F2';
}

/**
 * بناء حمولة الرسالة (payload) الجاهزة للإرسال عبر channel.send()
 * @param {object} messageConfig - جزء "message" من إعدادات welcome أو goodbye
 * @param {import('discord.js').GuildMember} member
 * @param {boolean} useEmbed
 * @param {boolean} mention
 */
function buildMessagePayload(messageConfig, member, useEmbed, mention = false) {
    try {
        const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 512 });

        if (!useEmbed) {
            const content = resolveVariables(messageConfig.content, member);
            return {
                content: mention ? `<@${member.id}> ${content}` : content,
            };
        }

        const embed = new EmbedBuilder().setColor(safeColor(messageConfig.color));

        if (messageConfig.title) {
            embed.setTitle(resolveVariables(messageConfig.title, member).slice(0, 256));
        }

        if (messageConfig.description) {
            embed.setDescription(resolveVariables(messageConfig.description, member).slice(0, 4096));
        }

        if (messageConfig.authorEnabled && messageConfig.authorText) {
            embed.setAuthor({
                name: resolveVariables(messageConfig.authorText, member).slice(0, 256),
                iconURL: messageConfig.authorIconFromAvatar ? avatarUrl : undefined,
            });
        }

        if (messageConfig.thumbnailEnabled) {
            const thumb = messageConfig.thumbnailFromAvatar ? avatarUrl : messageConfig.thumbnailUrl;
            if (thumb) embed.setThumbnail(thumb);
        }

        if (messageConfig.imageEnabled && messageConfig.imageUrl) {
            embed.setImage(messageConfig.imageUrl);
        }

        if (messageConfig.footerEnabled && messageConfig.footerText) {
            embed.setFooter({
                text: resolveVariables(messageConfig.footerText, member).slice(0, 2048),
                iconURL: messageConfig.footerIconFromAvatar ? avatarUrl : undefined,
            });
        }

        if (messageConfig.timestampEnabled) {
            embed.setTimestamp();
        }

        const payload = { embeds: [embed] };

        if (mention) {
            payload.content = `<@${member.id}>`;
        }

        return payload;
    } catch (err) {
        logger.error('MessageBuilder', 'فشل بناء الرسالة، سيتم استخدام رسالة احتياطية بسيطة', { error: err.message });
        return { content: `مرحبًا <@${member.id}>!` };
    }
}

module.exports = { buildMessagePayload, safeColor, VALID_HEX };
