const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from a URL or search query.')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Link or search terms to play')
        .setRequired(true),
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
  async execute(interaction) {
    const query = interaction.options.getString('query', true);
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: 'Join a voice channel before using /play.',
        ephemeral: true,
      });
    }

    let player = interaction.client.riffy.players.get(interaction.guildId);

    if (!player) {
      player = interaction.client.riffy.createConnection({
        guildId: interaction.guildId,
        voiceChannel: voiceChannel.id,
        textChannel: interaction.channelId,
        deaf: true,
      });
    } else if (player.voiceChannel !== voiceChannel.id) {
      player.setVoiceChannel(voiceChannel.id);
      player.setTextChannel(interaction.channelId);
    }

    await interaction.deferReply();

    const resolve = await interaction.client.riffy.resolve({
      query,
      requester: interaction.user,
    });
    const { loadType, tracks, playlistInfo } = resolve;

    if (!loadType || loadType === 'error' || !tracks?.length) {
      return interaction.editReply('No tracks were found for that query.');
    }

    if (loadType === 'playlist') {
      for (const track of tracks) {
        track.info.requester = interaction.user;
        player.queue.add(track);
      }

      await interaction.editReply(
        `Added **${tracks.length}** tracks from playlist **${playlistInfo.name}**.`,
      );
    } else {
      const track = tracks.shift();
      track.info.requester = interaction.user;
      player.queue.add(track);
      await interaction.editReply(`Added **${track.info.title}** to the queue.`);
    }

    if (!player.playing && !player.paused) {
      await player.play();
    }
  },
};
