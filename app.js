const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');

async function startBot() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./session');

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false, // We are using phone number, not QR
            browser: ['Ubuntu', 'Chrome', '22.04.4']
        });

        sock.ev.on('creds.update', saveCreds);

        if (!sock.authState.creds.registered) {
            console.log("🔄 Requesting Pairing Code...");
            const phoneNumber = '254725693306'; // Replace with your actual WhatsApp number
            
            const pairingCode = await sock.requestPairingCode(phoneNumber);
            console.log(`📌 Your Pairing Code: ${pairingCode}`);
        } else {
            console.log("✅ Already logged in.");
        }

        sock.ev.on('connection.update', (update) => {
            const { connection } = update;
            if (connection === 'close') {
                console.log("🛑 Disconnected! Restarting...");
                startBot();
            } else if (connection === 'open') {
                console.log("✅ Connected to WhatsApp!");
            }
        });

    } catch (error) {
        console.error("🔥 ERROR:", error);
    }
}

startBot();
