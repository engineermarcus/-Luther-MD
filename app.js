const { makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: ["Ubuntu", "Chrome", "22.04.4"], // Ensuring proper web emulation
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, pairCode } = update;
        console.log(`🔄 Connection Status: ${connection}`);

        if (pairCode) {
            console.log(`📌 Your Pair Code: ${pairCode}`);
            console.log("➡️ Enter this in WhatsApp > Linked Devices > Add Device.");
        } else if (connection === "open") {
            console.log("✅ WhatsApp bot is now active.");
        } else if (connection === "close") {
            console.log("❌ Connection closed. Restarting...");
            await delay(5000); // Wait 5 seconds before retrying
            startBot();
        }
    });

    // Explicitly request a pair code if not logged in
    if (!sock.authState.creds.registered) {
        const pair = await sock.requestPairingCode("your-whatsapp-number"); // Replace with your number
        console.log(`📌 Generated Pair Code: ${pair}`);
    }

    return sock;
}

// Reset session and start bot
async function resetSession() {
    console.log("🛑 Resetting session...");
    const fs = require("fs");
    if (fs.existsSync("./session")) {
        fs.rmSync("./session", { recursive: true });
    }
    await delay(2000);
    startBot();
}

resetSession();
