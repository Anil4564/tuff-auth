const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const app = express();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let bannedStorage = new Set();

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    const customId = interaction.customId;
    
    if (customId.startsWith('ban_')) {
        const robloxUserId = customId.split('_')[1]; 
        bannedStorage.add(robloxUserId);
        await interaction.reply({ content: `🚫 **SUCCESS:** Roblox User ID \`${robloxUserId}\` blacklisted!`, ephemeral: true });
    } 
    if (customId.startsWith('unban_')) {
        const robloxUserId = customId.split('_')[1];
        bannedStorage.delete(robloxUserId);
        await interaction.reply({ content: `✅ **SUCCESS:** Roblox User ID \`${robloxUserId}\` unbanned!`, ephemeral: true });
    }
});

app.get('/check', (req, res) => {
    const userId = req.query.userid;
    if (bannedStorage.has(userId)) {
        res.send("blacklisted"); 
    } else {
        res.send("clear"); 
    }
});

app.get('/', (req, res) => { res.send("Tuff Hub API Active"); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
client.login(process.env.DISCORD_TOKEN);
