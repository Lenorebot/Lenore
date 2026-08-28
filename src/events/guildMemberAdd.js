// ===================================================
// File: src/events/guildMemberAdd.js
// الوصف: يُنفَّذ عند انضمام عضو جديد للسيرفر - يستدعي نظام الترحيب
// ===================================================

const { handleWelcome } = require('../systems/welcome/welcome');
const { handleDiscordApiError } = require('../handlers/errorHandler');

module.exports = {
    name: 'guildMemberAdd',
    once: false,

    async execute(client, member) {
        try {
            await handleWelcome(member);
        } catch (err) {
            handleDiscordApiError(err, 'guildMemberAdd');
        }
    },
};
