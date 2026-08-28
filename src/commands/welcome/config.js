// ===================================================
// File: src/commands/welcome/config.js
// الوصف: أمر فرعي - فتح لوحة الإعداد التفاعلية الكاملة
// ===================================================

const db = require('../../database/DatabaseManager');
const { buildConfigPanel } = require('../../components/panelBuilder');

module.exports = {
    name: 'config',

    register(subcommand) {
        return subcommand.setName('config').setDescription('فتح لوحة الإعداد التفاعلية لنظام الترحيب والمغادرة');
    },

    async execute(interaction) {
        const guildConfig = db.getGuildConfig(interaction.guild.id);
        const panel = buildConfigPanel(guildConfig, interaction.guild.name);

        return interaction.reply({ ...panel, ephemeral: true });
    },
};
