// ===================================================
// File: src/events/interactionCreate.js
// الوصف: نقطة الدخول لكل التفاعلات - يوجّه الأوامر إلى commandHandler
//        ويوجّه الأزرار/القوائم/الـModals إلى componentHandler
// ===================================================

const { handleCommandError } = require('../handlers/errorHandler');
const { routeComponent } = require('../handlers/componentHandler');
const logger = require('../utils/logger');

module.exports = {
    name: 'interactionCreate',
    once: false,

    async execute(client, interaction) {
        // ==== تنفيذ Slash Commands ====
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                logger.warn('InteractionCreate', `تم استدعاء أمر غير مسجّل: ${interaction.commandName}`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                await handleCommandError(interaction, error, interaction.commandName);
            }
            return;
        }

        // ==== كل أنواع التفاعلات الأخرى (أزرار / قوائم / Modals) ====
        if (
            interaction.isButton() ||
            interaction.isChannelSelectMenu() ||
            interaction.isStringSelectMenu() ||
            interaction.isModalSubmit()
        ) {
            return routeComponent(interaction);
        }
    },
};
