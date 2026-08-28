// ===================================================
// File: src/commands/welcome/variables.js
// الوصف: أمر فرعي - عرض جميع المتغيرات المتاحة داخل الرسائل
// ===================================================

const { EmbedBuilder } = require('discord.js');
const { listVariables } = require('../../systems/welcome/variables');
const config = require('../../config/config');

module.exports = {
    name: 'variables',

    register(subcommand) {
        return subcommand.setName('variables').setDescription('عرض قائمة بجميع المتغيرات المتاحة لاستخدامها في الرسائل');
    },

    async execute(interaction) {
        const variables = listVariables();

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🔤 المتغيرات المتاحة')
            .setDescription(
                'يمكنك استخدام أي من هذه المتغيرات داخل العنوان، الوصف، الفوتر، أو الرسالة النصية:\n\n' +
                    variables.map((v) => `\`{${v.key}}\` — ${v.description}`).join('\n'),
            )
            .setFooter({ text: 'سيتم استبدال هذه المتغيرات تلقائيًا عند إرسال الرسالة الفعلية' });

        return interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
