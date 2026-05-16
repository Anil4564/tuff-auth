const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const app = express();

// Roblox'tan gelen verileri okumak için JSON ayarı
app.use(express.json());

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let bannedStorage = new Set();

// 📢 BURASI ÖNEMLİ: Geri bildirimlerin düşeceği Discord Kanal ID'sini buraya yaz!
const FEEDBACK_CHANNEL_ID = "1504664200713081004"; 

// Roblox'tan geri bildirim alan kapı
app.post('/send-feedback', async (req, res) => {
    try {
        const { username, userId, message } = req.body;

        const channel = await client.channels.fetch(FEEDBACK_CHANNEL_ID);
        if (!channel) return res.status(404).send("Kanal bulunamadı.");

        // Tuff Hub Altın Sarısı Embed Tasarımı
        const embed = new EmbedBuilder()
            .setTitle(`📩 New Feedback from ${username}`)
            .setDescription(message)
            .setColor(0xFFD700)
            .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`)
            .addFields(
                { name: "Username", value: username, inline: true },
                { name: "User ID", value: `\`${userId}\``, inline: true }
            )
            .setFooter({ text: "Tuff System | Control Center" })
            .setTimestamp();

        // 🔘 İŞTE BURASI: Discord'da kesinlikle görünecek olan butonlar
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`ban_${userId}`)
                .setLabel("🚫 Ban User (Auto)")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`unban_${userId}`)
                .setLabel("✅ Unban User (Auto)")
                .setStyle(ButtonStyle.Success)
        );

        // Mesajı bot aracılığıyla butonlarla birlikte gönderiyoruz
        await channel.send({ embeds: [embed], components: [row] });
        res.send("success");
    } catch (error) {
        console.error(error);
        res.status(500).send("error");
    }
});

// Butonlara tıklandığında çalışacak yasaklama mantığı
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

// Roblox scriptinin ban kontrol kapısı
app.get('/check', (req, res) => {
    const userId = req.query.userid;
    if (bannedStorage.has(userId)) { res.send("blacklisted"); } 
    else { res.send("clear"); }
});

app.get('/', (req, res) => { res.send("Tuff Hub API Active"); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
client.login(process.env.DISCORD_TOKEN);
