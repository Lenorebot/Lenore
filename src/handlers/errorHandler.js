// ===================================================
// File: src/handlers/errorHandler.js
// الوصف: معالجة الأخطاء على مستوى العملية، الأوامر، والتفاعلات
//        بحيث لا يؤدي أي خطأ إلى إيقاف البوت بالكامل.
// ===================================================

const logger = require('../utils/logger');

/**
 * تسجيل معالجات الأخطاء العامة على مستوى عملية Node.js بالكامل.
 */
function registerGlobalHandlers() {
    process.on('unhandledRejection', (reason) => {
        logger.error('GlobalHandler', 'Unhandled Promise Rejection', {
            error: reason instanceof Error ? reason.message : String(reason),
            stack: reason instanceof Error ? reason.stack : undefined,
        });
    });

    process.on('uncaughtException', (err) => {
        logger.error('GlobalHandler', 'Uncaught Exception', { error: err.message, stack: err.stack });
        // لا نوقف العملية - نسجل الخطأ فقط لضمان استمرار عمل البوت
    });

    logger.info('GlobalHandler', 'تم تفعيل معالج الأخطاء العام بنجاح');
}

/**
 * معالجة الأخطاء الناتجة عن تنفيذ Slash Command معيّن.
 */
async function handleCommandError(interaction, error, commandName) {
    logger.error('CommandError', `فشل تنفيذ الأمر: ${commandName}`, {
        error: error.message,
        stack: error.stack,
        user: interaction.user?.id,
        guild: interaction.guild?.id,
    });

    const errorMessage = '❌ حدث خطأ غير متوقع أثناء تنفيذ هذا الأمر. تم تسجيل المشكلة وسيتم النظر فيها.';

    try {
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: errorMessage, embeds: [], components: [] });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    } catch (nestedErr) {
        logger.error('CommandError', 'فشل حتى إرسال رسالة الخطأ للمستخدم', { error: nestedErr.message });
    }
}

/**
 * معالجة الأخطاء الناتجة عن تفاعل (زر / قائمة / Modal).
 */
async function handleInteractionError(interaction, error, context = 'component') {
    logger.error('InteractionError', `فشل تنفيذ تفاعل: ${context}`, {
        error: error.message,
        stack: error.stack,
        customId: interaction.customId,
        user: interaction.user?.id,
    });

    const errorMessage = '❌ حدث خطأ أثناء معالجة هذا الإجراء. حاول مرة أخرى.';

    try {
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    } catch (nestedErr) {
        logger.error('InteractionError', 'فشل حتى إرسال رسالة الخطأ للمستخدم', { error: nestedErr.message });
    }
}

/**
 * معالجة أخطاء Discord API بشكل عام (Rate limits, Missing Permissions, إلخ).
 */
function handleDiscordApiError(error, context = '') {
    logger.error('DiscordAPIError', `خطأ من Discord API ${context}`, {
        code: error.code,
        message: error.message,
    });
}

/**
 * معالجة أخطاء قاعدة البيانات.
 */
function handleDatabaseError(error, context = '') {
    logger.error('DatabaseError', `خطأ في قاعدة البيانات ${context}`, {
        error: error.message,
        stack: error.stack,
    });
}

module.exports = {
    registerGlobalHandlers,
    handleCommandError,
    handleInteractionError,
    handleDiscordApiError,
    handleDatabaseError,
};
