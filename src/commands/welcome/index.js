// ===================================================
// File: src/commands/welcome/index.js
// الوصف: الأمر الرئيسي /welcome الذي يجمع كل الأوامر الفرعية الموجودة في هذا المجلد
//        هذا هو الملف الوحيد في المجلد الذي يتم تسجيله فعليًا لدى Discord.
// ===================================================

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { canManageSystem } = require('../../utils/permissions');
const { checkCooldown } = require('../../utils/cooldown');
const config = require('../../config/config');

// كل الأوامر الفرعية الموجودة في هذا المجلد
const subcommandModules = [
    require('./setup'),
    require('./config'),
    require('./enable'),
    require('./disable'),
    require('./test'),
    require('./preview'),
    require('./reset'),
    require('./variables'),
];

const builder = new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('إدارة نظام الترحيب والمغادرة')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false);

for (const mod of subcommandModules) {
    builder.addSubcommand((sub) => mod.register(sub));
}

// فهرسة سريعة (name -> module) لاستدعاء التنفيذ الصحيح
const subcommandMap = new Map(subcommandModules.map((mod) => [mod.name, mod]));

module.exports = {
    data: builder,
    cooldown: config.cooldowns.defaultCommand,

    async execute(interaction) {
        // الأذونات الظاهرية لـ setDefaultMemberPermissions تمنع الاستخدام من واجهة Discord،
        // لكن نتحقق أيضًا برمجيًا كطبقة حماية إضافية.
        if (!canManageSystem(interaction.member)) {
            return interaction.reply({
                content: '🚫 هذا الأمر متاح فقط لمن يملك صلاحية **Administrator** أو **Manage Server**.',
                ephemeral: true,
            });
        }

        const cd = checkCooldown('welcome-command', interaction.user.id, config.cooldowns.defaultCommand);
        if (cd > 0) {
            return interaction.reply({ content: `⏱️ الرجاء الانتظار ${cd} ثانية قبل استخدام الأمر مرة أخرى.`, ephemeral: true });
        }

        const subcommandName = interaction.options.getSubcommand();
        const subcommand = subcommandMap.get(subcommandName);

        if (!subcommand) {
            return interaction.reply({ content: '❌ أمر فرعي غير معروف.', ephemeral: true });
        }

        await subcommand.execute(interaction);
    },
};
