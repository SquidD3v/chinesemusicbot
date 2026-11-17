const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'skip',
    description: 'Çalan şarkıyı atlar ve sıradaki şarkıya geçer.',
    async execute(message, args, distube) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.channel.send('Şarkıyı atlamak için bir ses kanalında olmalısınız!');
        }

        const queue = distube.getQueue(message.guild);
        if (!queue) {
            return message.channel.send('Şu anda çalan veya sırada bekleyen bir şarkı yok.');
        }
        
        try {
            const squid = await message.client.users.fetch('1060605338094669824').catch(() => null);
            // Eğer sırada başka şarkı yoksa skip() hata verir; bu yüzden stop() ile durduruyoruz
            if (queue.songs.length <= 1) {
                await queue.stop();
                const stopEmbed = new EmbedBuilder()
                    .setColor(0xffa500)
                    .setDescription('⏭️ Çalan şarkı atlandı ve sırada başka şarkı kalmadığı için oynatma durduruldu.');
                return message.channel.send({ embeds: [stopEmbed] });
            }

            const skippedSong = queue.songs[0];
            await queue.skip();

            const skipEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setDescription(`⏭️ **${skippedSong.name}** adlı şarkı atlandı!`)
                .setFooter({ text: 'made by Squid', iconURL: squid ? squid.displayAvatarURL() : undefined });

            message.channel.send({ embeds: [skipEmbed] });
        } catch (error) {
            console.error(error);
            message.channel.send('❌ 歌曲跳过时发生错误。');
        }
    }
};