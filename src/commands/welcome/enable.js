// ===================================================
// File: src/commands/welcome/enable.js
// الوصف: أمر فرعي - تفعيل نظام الترحيب أو المغادرة
// ===================================================

const db = require('../../database/DatabaseManager');
const logger = require('../../utils/logger');

module.exports = {
    name: 'enable',

    register(subcommand) {
        return subcommand
            .setName('enable')
            .setDescription('تفعيل نظام الترحيب أو المغادرة')
            .addStringOption((option) =>
                option
                    .setName('النظام')
                    .setDescription('النظام المراد تفعيله')
                    .setRequired(true)
                    .addChoices({ name: 'الترحيب 🎉', value: 'welcome' }, { name: 'المغادرة 👋', value: 'goodbye' }),
            );
    },

    async execute(interaction) {
        const system = interaction.options.getString('النظام');
        const guildConfig = db.getGuildConfig(interaction.guild.id);

        if (!guildConfig[system].channelId) {
            return interaction.reply({
                content: '⚠️ يجب تحديد روم أولًا عبر `/welcome setup` أو `/welcome config` قبل التفعيل.',
                ephemeral: true,
            });
        }

        db.updateGuildConfig(interaction.guild.id, (cfg) => {
            cfg[system].enabled = true;
        });

        logger.info('Command:enable', `${interaction.user.tag} فعّل نظام ${system}`, { guild: interaction.guild.id });

        return interaction.reply({
            content: `✅ تم تفعيل نظام **${system === 'welcome' ? 'الترحيب 🎉' : 'المغادرة 👋'}** بنجاح.`,
            ephemeral: true,
        });
    },
};
