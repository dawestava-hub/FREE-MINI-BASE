const { getAntideleteStatus } = require('../data/Antidelete');
const config = require('../config');

const handleAntidelete = async (conn, updates, store) => {
    try {
        for (const update of updates) {
            if (update.key.fromMe) continue;

            const isRevoke = update.update.messageStubType === 68 ||
                (update.update.message &&
                 update.update.message.protocolMessage &&
                 update.update.message.protocolMessage.type === 0);

            if (!isRevoke) continue;

            const chatId = update.key.remoteJid;
            const messageId = update.key.id;
            const participant = update.key.participant || chatId;

            const isEnabled = await getAntideleteStatus(chatId);
            if (!isEnabled) continue;

            // Use the inconnuboy custom store
            if (!store) continue;
            const msg = await store.loadMessage(chatId, messageId);
            if (!msg) continue;

            const alertText = `🚫 *ANTI-DELETE — INCONNU BOY* 🚫
👤 *User:* @${participant.split('@')[0]}
📅 *Date:* ${new Date().toLocaleString()}
> ${config.BOT_FOOTER}`;

            await conn.sendMessage(chatId, { text: alertText, mentions: [participant] });
            await conn.copyNForward(chatId, msg, false);
        }
    } catch (e) {
        console.error('❌ [INCONNU-BOY] Antidelete Error:', e.message);
    }
};

module.exports = { handleAntidelete };
