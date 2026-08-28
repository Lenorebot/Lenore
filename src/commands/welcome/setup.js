// ===================================================
// File: src/commands/welcome/setup.js
// الوصف: أمر فرعي - إعداد سريع لروم الترحيب أو المغادرة وتفعيله مباشرة
// ===================================================

const { ChannelType } = require('discord.js');
const db = require('../../database/DatabaseManager');
const config = require('../../config/config');
const logger = require('../../utils/logger');
const { checkBotChannelPermissions } = require('../../utils/permissions');

module.exports = {
    name: 'setup',

    register(subcommand) {
        return subcommand
            .setName('setup')
            .setDescription('إعداد سريع لنظام الترحيب أو المغادرة')
            .addStringOption((option) =>
                option
                    .setName('النظام')
                    .setDescription('النظام المراد إعداده')
                    .setRequired(true)
                    .addChoices({ name: 'الترحيب 🎉', value: 'welcome' }, { name: 'المغادرة 👋', value: 'goodbye' }),
            )
            .addChannelOption((option) =>
                option
                    .setName('الروم')
                    .setDescription('الروم الذي سيتم إرسال الرسائل إليه')
                    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                    .setRequired(true),
            );
    },

    async execute(interaction) {
        const system = interaction.options.getString('النظام');
        const channel = interaction.options.getChannel('الروم');

        const permCheck = checkBotChannelPermissions(channel, interaction.guild.members.me);
        if (!permCheck.ok) {
            return interaction.reply({
                content: `⚠️ لا أملك الصلاحيات الكافية في ${channel}. الصلاحيات الناقصة: **${permCheck.missing.join(', ')}**`,
                ephemeral: true,
            });
        }

        db.updateGuildConfig(interaction.guild.id, (cfg) => {
            cfg[system].channelId = channel.id;
            cfg[system].enabled = true;
        });

        logger.info('Command:setup', `${interaction.user.tag} أعدّ نظام ${system} على الروم ${channel.id}`, {
            guild: interaction.guild.id,
        });

        const systemLabel = system === 'welcome' ? 'الترحيب 🎉' : 'المغادرة 👋';

        return interaction.reply({
            content: `✅ تم إعداد نظام **${systemLabel}** بنجاح على الروم ${channel}\nيمكنك تخصيص باقي الإعدادات عبر \`/welcome config\`.`,
            ephemeral: true,
        });
    },
};
