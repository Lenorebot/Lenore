// ===================================================
// File: src/events/guildMemberRemove.js
// الوصف: يُنفَّذ عند مغادرة عضو للسيرفر - يستدعي نظام المغادرة
// ===================================================

const { handleGoodbye } = require('../systems/welcome/goodbye');
const { handleDiscordApiError } = require('../handlers/errorHandler');

module.exports = {
    name: 'guildMemberRemove',
    once: false,

    async execute(client, member) {
        try {
            await handleGoodbye(member);
        } catch (err) {
            handleDiscordApiError(err, 'guildMemberRemove');
        }
    },
};
