// ===================================================
// File: src/commands/welcome/preview.js
// الوصف: أمر فرعي - معاينة خاصة (Ephemeral) للرسالة بدون نشرها في الروم
// ===================================================

const db = require('../../database/DatabaseManager');
const { buildMessagePayload } = require('../../systems/welcome/messageBuilder');

module.exports = {
    name: 'preview',

    register(subcommand) {
        return subcommand
            .setName('preview')
            .setDescription('معاينة رسالة الترحيب/المغادرة بشكل خاص لك فقط')
            .addStringOption((option) =>
                option
                    .setName('النظام')
                    .setDescription('النظام المراد معاينته')
                    .setRequired(true)
                    .addChoices({ name: 'الترحيب 🎉', value: 'welcome' }, { name: 'المغادرة 👋', value: 'goodbye' }),
            );
    },

    async execute(interaction) {
        const system = interaction.options.getString('النظام');
        const guildConfig = db.getGuildConfig(interaction.guild.id);
        const systemConfig = guildConfig[system];

        const payload = buildMessagePayload(
            systemConfig.message,
            interaction.member,
            systemConfig.useEmbed,
            system === 'welcome' ? systemConfig.mention : false,
        );

        return interaction.reply({ content: '👁️ **هذه معاينة خاصة بك فقط:**', ...payload, ephemeral: true });
    },
};
