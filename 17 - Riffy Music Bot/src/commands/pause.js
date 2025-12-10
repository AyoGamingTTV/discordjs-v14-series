const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause or resume the current track.')
    .setDMPermission(false),
  async execute(interaction) {
    const player = interaction.client.riffy.players.get(interaction.guildId);

    if (!player || !player.current) {
      return interaction.reply({ content: 'Nothing is playing.', ephemeral: true });
    }

    const toggled = !player.paused;
    player.pause(toggled);

    return interaction.reply(toggled ? '⏸️ Paused playback.' : '▶️ Resumed playback.');
  },
};
