const dotenv = require('dotenv');
dotenv.config();
const { Client, GatewayIntentBits, Collection, Events, ActivityType } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { YouTubePlugin } = require('@distube/youtube');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const ffmpeg = require('ffmpeg-static');
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    ws: {
        properties: {
            browser: 'Discord Android' // Botun profilinde mobil ikonu çıkmasını sağlar
        }
    }
});

client.commands = new Collection();
client.radioData = new Map();

const distube = new DisTube(client, {
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: false,
    ffmpeg: {
        path: ffmpeg
    },
    plugins: [
        new SpotifyPlugin(),
        new YouTubePlugin(),
        new YtDlpPlugin()
    ]
});

client.distube = distube;

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.config = {
    prefix: process.env.PREFIX || '!'
};

client.once(Events.ClientReady, () => {
    console.log(`${client.user.tag} aktif ve müzik çalmaya hazır!`);

    client.user.setActivity('以毛澤東的名義！', {
        type: ActivityType.Custom // Özel durum olarak gösterir (Oynuyor/İzliyor yazısı olmadan)
    });
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(client.config.prefix)) return;

    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args, distube);
    } catch (error) {
        console.error(error);
        message.reply('执行命令时发生错误。');
    }
});

// Bot kanaldan atılırsa veya bağlantısı koparsa otomatik geri bağlanma
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    if (oldState.id !== client.user.id) return;

    // Bot ses kanalından atıldıysa veya bağlantısı koptuysa
    if (oldState.channelId && !newState.channelId) {
        const radio = client.radioData.get(oldState.guild.id);
        
        if (radio && radio.active) {
            console.log('Bot kanaldan çıkarıldı, 3 saniye içinde geri bağlanıyor...');
            
            setTimeout(async () => {
                try {
                    const targetChannel = oldState.guild.channels.cache.get(radio.voiceChannelId);
                    if (!targetChannel) return;

                    // 1. Önce DisTube'un hafızasındaki eski/bozuk ses bağlantısını zorla temizle
                    try {
                        distube.voices.leave(oldState.guild.id);
                    } catch (e) {}

                    // 2. Kısa bir bekleme sonrası sıfırdan tekrar bağlan ve çal
                    setTimeout(async () => {
                        await distube.play(targetChannel, radio.query, {
                            member: radio.member,
                            textChannel: radio.textChannel
                        });

                        const queue = distube.getQueue(oldState.guild);
                        if (queue) {
                            queue.setRepeatMode(1);
                        }
                    }, 1000);

                } catch (err) {
                    console.error('无线连接重新建立错误:', err);
                }
            }, 2500);
        }
    }
});

distube
    .on('playSong', (queue, song) => {
        // Döngü açıkken aynı şarkı her başa sardığında tekrar mesaj atmasını engeller
        if (queue.repeatMode === 1 && queue.lastSongId === song.id) return;
        queue.lastSongId = song.id;

        queue.textChannel.send(`🎶 正在播放: **${song.name}** - \`${song.formattedDuration}\``);
    })
    .on('addSong', (queue, song) => {
        queue.textChannel.send(`✅ 已加入队列: **${song.name}** - \`${song.formattedDuration}\``);
    })
    .on('error', (error, queue) => {
        console.error(error);
        if (queue && queue.textChannel) {
            queue.textChannel.send(`❌ 执行命令时发生错误: ${error.message.slice(0, 1900)}`);
        }
    });

client.login(process.env.TOKEN);