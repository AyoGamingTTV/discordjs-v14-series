const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current music queue.')
    .setDMPermission(false),
  async execute(interaction) {
    const player = interaction.client.riffy.players.get(interaction.guildId);

    if (!player || (!player.current && !player.queue.size)) {
      return interaction.reply({ content: 'The queue is empty.', ephemeral: true });
    }

    const description = [];

    if (player.current) {
      description.push(`**Now:** ${player.current.info.title} — ${player.current.info.author}`);
    }

    if (player.queue.size) {
      const lines = player.queue
        .slice(0, 10)
        .map((track, index) => `${index + 1}. ${track.info.title} — ${track.info.author}`);
      description.push('\n**Up next:**');
      description.push(lines.join('\n'));

      if (player.queue.size > 10) {
        description.push(`...and ${player.queue.size - 10} more.`);
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('Queue')
      .setDescription(description.join('\n'))
      .setColor(0x2b2d31);

    return interaction.reply({ embeds: [embed] });
  },
};
