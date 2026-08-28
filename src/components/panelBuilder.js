// ===================================================
// File: src/components/panelBuilder.js
// الوصف: بناء لوحة الإعداد التفاعلية (Embed + Buttons + Select Menus)
// ===================================================

const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    StringSelectMenuBuilder,
    ChannelType,
} = require('discord.js');
const config = require('../config/config');

const onOff = (bool) => (bool ? '🟢 مفعّل' : '🔴 معطّل');
const channelMention = (id) => (id ? `<#${id}>` : 'لم يتم التحديد');

/**
 * قائمة الخيارات القابلة للتبديل السريع عبر Select Menu واحد.
 */
function buildToggleOptions(guildConfig) {
    const options = [
        {
            label: `منشن العضو عند الترحيب: ${guildConfig.welcome.mention ? 'مفعّل' : 'معطّل'}`,
            value: 'welcome:mention',
            emoji: '🔔',
        },
        {
            label: `وضع Embed للترحيب: ${guildConfig.welcome.useEmbed ? 'مفعّل' : 'معطّل'}`,
            value: 'welcome:useEmbed',
            emoji: '🎨',
        },
        {
            label: `صورة العضو (Thumbnail) للترحيب: ${guildConfig.welcome.message.thumbnailEnabled ? 'مفعّل' : 'معطّل'}`,
            value: 'welcome:message.thumbnailEnabled',
            emoji: '🖼️',
        },
        {
            label: `وضع Embed للمغادرة: ${guildConfig.goodbye.useEmbed ? 'مفعّل' : 'معطّل'}`,
            value: 'goodbye:useEmbed',
            emoji: '🎨',
        },
        {
            label: `صورة العضو (Thumbnail) للمغادرة: ${guildConfig.goodbye.message.thumbnailEnabled ? 'مفعّل' : 'معطّل'}`,
            value: 'goodbye:message.thumbnailEnabled',
            emoji: '🖼️',
        },
    ];

    return options.map((opt) => ({
        label: opt.label.slice(0, 100),
        value: opt.value,
        emoji: opt.emoji,
    }));
}

/**
 * بناء الرسالة الكاملة للوحة الإعداد (Embed + جميع صفوف الأزرار/القوائم).
 */
function buildConfigPanel(guildConfig, guildName) {
    const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('🎛️ لوحة إعداد نظام الترحيب والمغادرة')
        .setDescription(`إعدادات سيرفر **${guildName}**\nاستخدم الأزرار والقوائم أدناه للتحكم الكامل بالنظام.`)
        .addFields(
            {
                name: '🎉 نظام الترحيب',
                value: [
                    `**الحالة:** ${onOff(guildConfig.welcome.enabled)}`,
                    `**الروم:** ${channelMention(guildConfig.welcome.channelId)}`,
                    `**النوع:** ${guildConfig.welcome.useEmbed ? 'Embed' : 'نص عادي'}`,
                    `**المنشن:** ${guildConfig.welcome.mention ? 'مفعّل' : 'معطّل'}`,
                ].join('\n'),
                inline: true,
            },
            {
                name: '👋 نظام المغادرة',
                value: [
                    `**الحالة:** ${onOff(guildConfig.goodbye.enabled)}`,
                    `**الروم:** ${channelMention(guildConfig.goodbye.channelId)}`,
                    `**النوع:** ${guildConfig.goodbye.useEmbed ? 'Embed' : 'نص عادي'}`,
                ].join('\n'),
                inline: true,
            },
        )
        .setFooter({ text: 'التعديلات تُحفظ تلقائيًا فور تطبيقها' })
        .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('wl:toggle:welcome')
            .setLabel(guildConfig.welcome.enabled ? 'إيقاف الترحيب' : 'تفعيل الترحيب')
            .setStyle(guildConfig.welcome.enabled ? ButtonStyle.Danger : ButtonStyle.Success)
            .setEmoji('🎉'),
        new ButtonBuilder()
            .setCustomId('wl:toggle:goodbye')
            .setLabel(guildConfig.goodbye.enabled ? 'إيقاف المغادرة' : 'تفعيل المغادرة')
            .setStyle(guildConfig.goodbye.enabled ? ButtonStyle.Danger : ButtonStyle.Success)
            .setEmoji('👋'),
        new ButtonBuilder()
            .setCustomId('wl:edit:welcome')
            .setLabel('تعديل رسالة الترحيب')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('📝'),
        new ButtonBuilder()
            .setCustomId('wl:edit:goodbye')
            .setLabel('تعديل رسالة المغادرة')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('📝'),
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ChannelSelectMenuBuilder()
            .setCustomId('wl:setchannel:welcome')
            .setPlaceholder('📥 اختر روم الترحيب')
            .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setMinValues(1)
            .setMaxValues(1),
    );

    const row3 = new ActionRowBuilder().addComponents(
        new ChannelSelectMenuBuilder()
            .setCustomId('wl:setchannel:goodbye')
            .setPlaceholder('📤 اختر روم المغادرة')
            .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setMinValues(1)
            .setMaxValues(1),
    );

    const row4 = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('wl:togglefield')
            .setPlaceholder('⚙️ اختر خيارًا لتبديله (تشغيل/إيقاف)')
            .addOptions(buildToggleOptions(guildConfig)),
    );

    const row5 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('wl:preview:welcome')
            .setLabel('معاينة الترحيب')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('👁️'),
        new ButtonBuilder()
            .setCustomId('wl:preview:goodbye')
            .setLabel('معاينة المغادرة')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('👁️'),
        new ButtonBuilder()
            .setCustomId('wl:reset')
            .setLabel('إعادة تعيين الكل')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🗑️'),
    );

    return { embeds: [embed], components: [row1, row2, row3, row4, row5] };
}

module.exports = { buildConfigPanel };
