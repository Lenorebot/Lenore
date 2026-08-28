// ===================================================
// File: src/commands/welcome/disable.js
// الوصف: أمر فرعي - إيقاف نظام الترحيب أو المغادرة
// ===================================================

const db = require('../../database/DatabaseManager');
const logger = require('../../utils/logger');

module.exports = {
    name: 'disable',

    register(subcommand) {
        return subcommand
            .setName('disable')
            .setDescription('إيقاف نظام الترحيب أو المغادرة')
            .addStringOption((option) =>
                option
                    .setName('النظام')
                    .setDescription('النظام المراد إيقافه')
                    .setRequired(true)
                    .addChoices({ name: 'الترحيب 🎉', value: 'welcome' }, { name: 'المغادرة 👋', value: 'goodbye' }),
            );
    },

    async execute(interaction) {
        const system = interaction.options.getString('النظام');

        db.updateGuildConfig(interaction.guild.id, (cfg) => {
            cfg[system].enabled = false;
        });

        logger.info('Command:disable', `${interaction.user.tag} أوقف نظام ${system}`, { guild: interaction.guild.id });

        return interaction.reply({
            content: `🔴 تم إيقاف نظام **${system === 'welcome' ? 'الترحيب 🎉' : 'المغادرة 👋'}**.`,
            ephemeral: true,
        });
    },
};
