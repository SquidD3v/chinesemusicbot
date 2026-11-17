const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'yardim',
    description: 'Botta bulunan tüm komutları listeler.',
    async execute(message, args, distube) {
        const prefix = message.client.config.prefix || '!';
        const squid = await message.client.users.fetch('1060605338094669824').catch(() => null);

        // Botun hafızasındaki tüm komutları çek ve liste haline getir
        const commandList = message.client.commands.map(cmd => {
            return `**${prefix}${cmd.name}** — ${cmd.description || 'Açıklama bulunmuyor.'}`;
        }).join('\n');

        const helpEmbed = new EmbedBuilder()
            .setColor(0x5865F2) // Discord mavisi
            .setTitle('毛泽东的私人空间')
            .setDescription(`您可以使用的所有命令均列于下方。:\n\n${commandList}`)
            .addFields({
                name: '用法示例',
                value: `\`${prefix}play <歌曲名称或链接>\`\n\`${prefix}sesegit <kanalID> <歌曲名称>\`\n\`${prefix}skip\``
            })
            .setFooter({ text: 'made by Squid', iconURL: squid ? squid.displayAvatarURL() : undefined })
            .setTimestamp();

        message.channel.send({ embeds: [helpEmbed] });
    }
};