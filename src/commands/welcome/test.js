// ===================================================
// File: src/commands/welcome/test.js
// الوصف: أمر فرعي - إرسال رسالة اختبار فعلية في الروم المحدد
// ===================================================

const db = require('../../database/DatabaseManager');
const logger = require('../../utils/logger');
const { buildMessagePayload } = require('../../systems/welcome/messageBuilder');
const { checkBotChannelPermissions } = require('../../utils/permissions');

module.exports = {
    name: 'test',

    register(subcommand) {
        return subcommand
            .setName('test')
            .setDescription('إرسال رسالة اختبار حقيقية في روم الترحيب/المغادرة المحدد')
            .addStringOption((option) =>
                option
                    .setName('النظام')
                    .setDescription('النظام المراد اختباره')
                    .setRequired(true)
                    .addChoices({ name: 'الترحيب 🎉', value: 'welcome' }, { name: 'المغادرة 👋', value: 'goodbye' }),
            );
    },

    async execute(interaction) {
        const system = interaction.options.getString('النظام');
        const guildConfig = db.getGuildConfig(interaction.guild.id);
        const systemConfig = guildConfig[system];

        if (!systemConfig.channelId) {
            return interaction.reply({ content: '⚠️ لم يتم تحديد روم لهذا النظام بعد.', ephemeral: true });
        }

        const channel = interaction.guild.channels.cache.get(systemConfig.channelId);
        if (!channel) {
            return interaction.reply({ content: '❌ الروم المحدد لم يعد موجودًا.', ephemeral: true });
        }

        const permCheck = checkBotChannelPermissions(channel, interaction.guild.members.me);
        if (!permCheck.ok) {
            return interaction.reply({
                content: `⚠️ صلاحيات ناقصة في ${channel}: **${permCheck.missing.join(', ')}**`,
                ephemeral: true,
            });
        }

        const payload = buildMessagePayload(
            systemConfig.message,
            interaction.member,
            systemConfig.useEmbed,
            system === 'welcome' ? systemConfig.mention : false,
        );

        await channel.send(payload);
        logger.info('Command:test', `${interaction.user.tag} اختبر نظام ${system}`, { guild: interaction.guild.id });

        return interaction.reply({ content: `✅ تم إرسال رسالة اختبار في ${channel}.`, ephemeral: true });
    },
};
