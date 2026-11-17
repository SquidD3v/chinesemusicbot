const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'play',
    description: 'YouTube veya Spotify üzerinden şarkı çalar.',
    async execute(message, args, distube) {
        if (!args.length) {
            return message.channel.send('Lütfen çalmak istediğiniz şarkının adını veya bağlantısını yazın.');
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription('你必须处于语音频道中才能播放音乐！')
                .setFooter({ text: 'made by Squid', iconURL: squid ? squid.displayAvatarURL() : undefined });

            return message.channel.send({ embeds: [errorEmbed] });
        }

        const query = args.join(' ');

        try {
            await distube.play(voiceChannel, query, {
                member: message.member,
                textChannel: message.channel,
                message
            });
        } catch (error) {
            console.error(error);
            message.channel.send('Şarkı oynatılırken bir sorun oluştu.');
        }
    }
};