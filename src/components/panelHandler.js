// ===================================================
// File: src/components/panelHandler.js
// الوصف: منطق التعامل مع كل تفاعلات لوحة الإعداد (أزرار / قوائم / Modals)
// ===================================================

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../database/DatabaseManager');
const logger = require('../utils/logger');
const { canManageSystem } = require('../utils/permissions');
const { buildConfigPanel } = require('./panelBuilder');
const { buildEmbedEditModal, buildTextEditModal } = require('./modalBuilder');
const { buildMessagePayload } = require('../systems/welcome/messageBuilder');
const { safeColor, VALID_HEX } = require('../systems/welcome/messageBuilder');
const { checkCooldown } = require('../utils/cooldown');

function getFieldByPath(obj, pathStr) {
    return pathStr.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function setFieldByPath(obj, pathStr, value) {
    const parts = pathStr.split('.');
    let cursor = obj;
    for (let i = 0; i < parts.length - 1; i++) cursor = cursor[parts[i]];
    cursor[parts[parts.length - 1]] = value;
}

async function refreshPanel(interaction, guildId) {
    const guildConfig = db.getGuildConfig(guildId);
    const panel = buildConfigPanel(guildConfig, interaction.guild.name);
    await interaction.update(panel);
}

async function guardPermission(interaction) {
    if (!canManageSystem(interaction.member)) {
        await interaction.reply({
            content: '🚫 لا تملك صلاحية استخدام هذه اللوحة (تحتاج Administrator أو Manage Server).',
            ephemeral: true,
        });
        return false;
    }
    return true;
}

// ---------------------------------------------------
// Buttons
// ---------------------------------------------------
async function handleButton(interaction) {
    const [, action, system] = interaction.customId.split(':');

    if (!(await guardPermission(interaction))) return;

    const cd = checkCooldown('panel-button', interaction.user.id, 2);
    if (cd > 0) {
        return interaction.reply({ content: `⏱️ الرجاء الانتظار ${cd} ثانية قبل المحاولة مجددًا.`, ephemeral: true });
    }

    switch (action) {
        case 'toggle': {
            db.updateGuildConfig(interaction.guild.id, (cfg) => {
                cfg[system].enabled = !cfg[system].enabled;
            });
            return refreshPanel(interaction, interaction.guild.id);
        }

        case 'edit': {
            const guildConfig = db.getGuildConfig(interaction.guild.id);
            const systemConfig = guildConfig[system];
            const modal = systemConfig.useEmbed
                ? buildEmbedEditModal(system, systemConfig.message)
                : buildTextEditModal(system, systemConfig.message);
            return interaction.showModal(modal);
        }

        case 'preview': {
            const guildConfig = db.getGuildConfig(interaction.guild.id);
            const systemConfig = guildConfig[system];
            const payload = buildMessagePayload(
                systemConfig.message,
                interaction.member,
                systemConfig.useEmbed,
                system === 'welcome' ? systemConfig.mention : false,
            );
            return interaction.reply({ content: '👁️ **معاينة:**', ...payload, ephemeral: true });
        }

        case 'reset': {
            const confirmRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('wl:reset:confirm').setLabel('تأكيد إعادة التعيين').setStyle(ButtonStyle.Danger).setEmoji('⚠️'),
                new ButtonBuilder().setCustomId('wl:reset:cancel').setLabel('إلغاء').setStyle(ButtonStyle.Secondary),
            );
            return interaction.reply({
                content: '⚠️ هل أنت متأكد من إعادة تعيين **جميع** إعدادات الترحيب والمغادرة؟ لا يمكن التراجع عن هذا الإجراء.',
                components: [confirmRow],
                ephemeral: true,
            });
        }

        default:
            return;
    }
}

async function handleResetConfirmation(interaction) {
    if (!(await guardPermission(interaction))) return;

    const [, , decision] = interaction.customId.split(':');

    if (decision === 'cancel') {
        return interaction.update({ content: '❎ تم إلغاء العملية.', components: [] });
    }

    db.createBackup(interaction.guild.id);
    db.resetGuildConfig(interaction.guild.id);
    logger.info('Panel', `${interaction.user.tag} قام بإعادة تعيين إعدادات السيرفر ${interaction.guild.id}`);

    await interaction.update({ content: '✅ تمت إعادة تعيين جميع الإعدادات إلى الوضع الافتراضي.', components: [] });
}

// ---------------------------------------------------
// Channel Select Menus
// ---------------------------------------------------
async function handleChannelSelect(interaction) {
    const [, , system] = interaction.customId.split(':');

    if (!(await guardPermission(interaction))) return;

    const channelId = interaction.values[0];

    db.updateGuildConfig(interaction.guild.id, (cfg) => {
        cfg[system].channelId = channelId;
    });

    logger.info('Panel', `تم تعيين روم ${system} إلى ${channelId} في السيرفر ${interaction.guild.id}`);
    return refreshPanel(interaction, interaction.guild.id);
}

// ---------------------------------------------------
// String Select Menu (Toggle Fields)
// ---------------------------------------------------
async function handleToggleFieldSelect(interaction) {
    if (!(await guardPermission(interaction))) return;

    const [system, fieldPath] = interaction.values[0].split(':');

    db.updateGuildConfig(interaction.guild.id, (cfg) => {
        const current = getFieldByPath(cfg[system], fieldPath);
        setFieldByPath(cfg[system], fieldPath, !current);
    });

    return refreshPanel(interaction, interaction.guild.id);
}

// ---------------------------------------------------
// Modal Submissions
// ---------------------------------------------------
async function handleModalSubmit(interaction) {
    const [, , system, mode] = interaction.customId.split(':');

    if (!(await guardPermission(interaction))) return;

    if (mode === 'text') {
        const content = interaction.fields.getTextInputValue('content');
        db.updateGuildConfig(interaction.guild.id, (cfg) => {
            cfg[system].message.content = content;
        });
        return interaction.reply({ content: '✅ تم حفظ الرسالة النصية بنجاح.', ephemeral: true });
    }

    // embed mode
    const title = interaction.fields.getTextInputValue('title');
    const description = interaction.fields.getTextInputValue('description');
    const colorRaw = interaction.fields.getTextInputValue('color');
    const footer = interaction.fields.getTextInputValue('footer');
    const image = interaction.fields.getTextInputValue('image');

    const color = VALID_HEX.test(colorRaw) ? colorRaw : safeColor(null);
    const colorWarning = colorRaw && !VALID_HEX.test(colorRaw) ? '\n⚠️ اللون المُدخل غير صالح، تم استخدام اللون الافتراضي بدلًا منه.' : '';

    db.updateGuildConfig(interaction.guild.id, (cfg) => {
        cfg[system].message.title = title;
        cfg[system].message.description = description;
        cfg[system].message.color = color;
        cfg[system].message.footerText = footer;
        cfg[system].message.footerEnabled = Boolean(footer);
        cfg[system].message.imageUrl = image || null;
        cfg[system].message.imageEnabled = Boolean(image);
    });

    return interaction.reply({ content: `✅ تم حفظ رسالة الـ Embed بنجاح.${colorWarning}`, ephemeral: true });
}

module.exports = {
    handleButton,
    handleResetConfirmation,
    handleChannelSelect,
    handleToggleFieldSelect,
    handleModalSubmit,
};
