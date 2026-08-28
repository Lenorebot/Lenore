// ===================================================
// File: src/components/modalBuilder.js
// الوصف: بناء الـ Modals الخاصة بتعديل رسائل الترحيب/المغادرة
// ===================================================

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

/**
 * Modal لتعديل رسالة الـ Embed (تستخدم مع الترحيب والمغادرة على حد سواء)
 * @param {'welcome'|'goodbye'} system
 * @param {object} messageConfig
 */
function buildEmbedEditModal(system, messageConfig) {
    const modal = new ModalBuilder()
        .setCustomId(`wl:modalsubmit:${system}:embed`)
        .setTitle(system === 'welcome' ? 'تعديل رسالة الترحيب (Embed)' : 'تعديل رسالة المغادرة (Embed)');

    const titleInput = new TextInputBuilder()
        .setCustomId('title')
        .setLabel('العنوان (Title)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(256)
        .setValue(messageConfig.title || '');

    // 🔴 تم اختصار النص ليكون أقل من 45 حرفاً
    const descInput = new TextInputBuilder()
        .setCustomId('description')
        .setLabel('الوصف (يدعم المتغيرات مثل {user})')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setMaxLength(1000)
        .setValue(messageConfig.description || '');

    const colorInput = new TextInputBuilder()
        .setCustomId('color')
        .setLabel('اللون (Hex - مثال: #5865F2)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(7)
        .setValue(messageConfig.color || '#5865F2');

    const footerInput = new TextInputBuilder()
        .setCustomId('footer')
        .setLabel('نص الفوتر (Footer)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(200)
        .setValue(messageConfig.footerText || '');

    // 🔴 تم اختصار النص ليكون أقل من 45 حرفاً
    const imageInput = new TextInputBuilder()
        .setCustomId('image')
        .setLabel('رابط الصورة (Image URL) - اختياري')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setValue(messageConfig.imageUrl || '');

    modal.addComponents(
        new ActionRowBuilder().addComponents(titleInput),
        new ActionRowBuilder().addComponents(descInput),
        new ActionRowBuilder().addComponents(colorInput),
        new ActionRowBuilder().addComponents(footerInput),
        new ActionRowBuilder().addComponents(imageInput),
    );

    return modal;
}

/**
 * Modal لتعديل الرسالة النصية العادية (Plain Text)
 */
function buildTextEditModal(system, messageConfig) {
    const modal = new ModalBuilder()
        .setCustomId(`wl:modalsubmit:${system}:text`)
        .setTitle(system === 'welcome' ? 'تعديل رسالة الترحيب (نص)' : 'تعديل رسالة المغادرة (نص)');

    // 🔴 تم اختصار النص ليكون أقل من 45 حرفاً
    const contentInput = new TextInputBuilder()
        .setCustomId('content')
        .setLabel('نص الرسالة (يدعم {user} و {server})')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1500)
        .setValue(messageConfig.content || '');

    modal.addComponents(new ActionRowBuilder().addComponents(contentInput));

    return modal;
}

module.exports = { buildEmbedEditModal, buildTextEditModal };