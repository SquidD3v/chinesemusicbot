const { EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    name: 'sesegit',
    description: 'Belirtilen ses kanalına girer ve seçilen şarkıyı sürekli döngüde çalar.',
    async execute(message, args, distube) {
        if (args.length < 2) {
            return message.channel.send('⚠️ Doğru kullanım: `!sesegit <SesKanalıID> <Şarkı Adı veya Link>`');
        }

        const channelId = args.shift();
        const query = args.join(' ');
        const voiceChannel = message.guild.channels.cache.get(channelId);

        if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
            return message.channel.send('❌ Geçerli bir ses kanalı ID\'si girmelisin!');
        }

        try {
            // Bot atılırsa geri dönebilmesi için bilgileri sunucu bazlı hafızaya kaydet
            if (!message.client.radioData) message.client.radioData = new Map();
            message.client.radioData.set(message.guild.id, {
                voiceChannelId: channelId,
                textChannel: message.channel,
                query: query,
                member: message.member,
                active: true
            });

            await distube.play(voiceChannel, query, {
                member: message.member,
                textChannel: message.channel,
                message
            });

            const queue = distube.getQueue(message.guild);
            if (queue) {
                queue.setRepeatMode(1);
            }

            const squid = await message.client.users.fetch('1060605338094669824').catch(() => null);

            const radioEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('📻 7/24 Radyo Modu Başlatıldı')
                .setDescription(`**Kanal:** ${voiceChannel.name}\n**Çalınan:** ${query}\n**Döngü:** Aktif (Atılsa bile geri döner)`)
                .setFooter({ 
                    text: 'made by Squid', 
                    iconURL: squid ? squid.displayAvatarURL() : undefined 
                });

            message.channel.send({ embeds: [radioEmbed] });
        } catch (error) {
            console.error(error);
            message.channel.send('❌ Kanala bağlanırken veya şarkı başlatılırken bir hata oluştu.');
        }
    }
};