// ===================================================
// File: src/commands/welcome/reset.js
// الوصف: أمر فرعي - إعادة تعيين إعدادات النظام (مع تأكيد عبر أزرار)
// ===================================================

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'reset',

    register(subcommand) {
        return subcommand.setName('reset').setDescription('إعادة تعيين جميع إعدادات الترحيب والمغادرة إلى الوضع الافتراضي');
    },

    async execute(interaction) {
        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('wl:reset:confirm').setLabel('تأكيد إعادة التعيين').setStyle(ButtonStyle.Danger).setEmoji('⚠️'),
            new ButtonBuilder().setCustomId('wl:reset:cancel').setLabel('إلغاء').setStyle(ButtonStyle.Secondary),
        );

        return interaction.reply({
            content: '⚠️ هل أنت متأكد من إعادة تعيين **جميع** إعدادات الترحيب والمغادرة؟ سيتم إنشاء نسخة احتياطية تلقائيًا قبل الحذف، لكن لا يمكن التراجع عن هذا الإجراء من داخل البوت.',
            components: [confirmRow],
            ephemeral: true,
        });
    },
};
