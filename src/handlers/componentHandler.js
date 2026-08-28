// ===================================================
// File: src/handlers/componentHandler.js
// الوصف: موجّه (Router) لكل تفاعلات الأزرار/القوائم/الـModals
//        بحيث يسهل إضافة أنظمة تفاعلية جديدة مستقبلًا بدون تعديل هذا الملف كثيرًا.
// ===================================================

const panelHandler = require('../components/panelHandler');
const { handleInteractionError } = require('./errorHandler');

async function routeComponent(interaction) {
    try {
        // ==== أزرار (Buttons) ====
        if (interaction.isButton()) {
            if (interaction.customId.startsWith('wl:reset:')) {
                return panelHandler.handleResetConfirmation(interaction);
            }
            if (interaction.customId.startsWith('wl:')) {
                return panelHandler.handleButton(interaction);
            }
            return;
        }

        // ==== قوائم اختيار الرومات (Channel Select Menus) ====
        if (interaction.isChannelSelectMenu()) {
            if (interaction.customId.startsWith('wl:setchannel:')) {
                return panelHandler.handleChannelSelect(interaction);
            }
            return;
        }

        // ==== قوائم اختيار نصية (String Select Menus) ====
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'wl:togglefield') {
                return panelHandler.handleToggleFieldSelect(interaction);
            }
            return;
        }

        // ==== إرسال Modal ====
        if (interaction.isModalSubmit()) {
            if (interaction.customId.startsWith('wl:modalsubmit:')) {
                return panelHandler.handleModalSubmit(interaction);
            }
            return;
        }
    } catch (error) {
        await handleInteractionError(interaction, error, interaction.customId || 'unknown');
    }
}

module.exports = { routeComponent };
