const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Display the currently playing track.')
    .setDMPermission(false),
  async execute(interaction) {
    const player = interaction.client.riffy.players.get(interaction.guildId);

    if (!player || !player.current) {
      return interaction.reply({ content: 'Nothing is playing right now.', ephemeral: true });
    }

    const track = player.current;
    const embed = new EmbedBuilder()
      .setTitle('Now Playing')
      .setDescription(`**${track.info.title}**\nby **${track.info.author}**`)
      .setURL(track.info.uri ?? null)
      .setColor(0x2b2d31)
      .addFields(
        { name: 'Requested by', value: `<@${track.info.requester?.id ?? interaction.user.id}>`, inline: true },
        { name: 'Duration', value: `${Math.floor(track.info.length / 60000)}:${String(Math.floor((track.info.length % 60000) / 1000)).padStart(2, '0')}`, inline: true },
      );

    return interaction.reply({ embeds: [embed] });
  },
};
