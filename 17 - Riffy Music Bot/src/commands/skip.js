const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the currently playing track.')
    .setDMPermission(false),
  async execute(interaction) {
    const player = interaction.client.riffy.players.get(interaction.guildId);

    if (!player || !player.current) {
      return interaction.reply({ content: 'Nothing is playing.', ephemeral: true });
    }

    player.stop();
    return interaction.reply('⏭️ Skipped the current track.');
  },
};
