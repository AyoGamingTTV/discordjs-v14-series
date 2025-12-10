const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop playback and clear the queue.')
    .setDMPermission(false),
  async execute(interaction) {
    const player = interaction.client.riffy.players.get(interaction.guildId);

    if (!player) {
      return interaction.reply({ content: 'There is no active player.', ephemeral: true });
    }

    player.queue.clear();
    player.stop();
    player.destroy();

    return interaction.reply('⏹️ Stopped playback and cleared the queue.');
  },
};
