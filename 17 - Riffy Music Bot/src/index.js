require('dotenv').config();
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  Events,
  GatewayDispatchEvents,
} = require('discord.js');
const { Riffy } = require('riffy');
const path = require('path');
const loadCommands = require('./utils/loadCommands');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();
client.commandArray = [];

const commandsPath = path.join(__dirname, 'commands');
for (const command of loadCommands(commandsPath)) {
  client.commands.set(command.data.name, command);
  client.commandArray.push(command.data.toJSON());
}

const nodes = [
  {
    host: process.env.LAVALINK_HOST,
    port: Number(process.env.LAVALINK_PORT),
    password: process.env.LAVALINK_PASSWORD,
    secure: String(process.env.LAVALINK_SECURE).toLowerCase() === 'true',
  },
];

client.riffy = new Riffy(client, nodes, {
  send: (payload) => {
    const guild = client.guilds.cache.get(payload.d.guild_id);
    if (guild) guild.shard.send(payload);
  },
  defaultSearchPlatform: 'ytmsearch',
  restVersion: 'v4',
});

client.once(Events.ClientReady, async (readyClient) => {
  try {
    const targetGuildId = process.env.GUILD_ID;
    if (targetGuildId) {
      const guild = await readyClient.guilds.fetch(targetGuildId);
      await guild.commands.set(client.commandArray);
      console.log(`✅ Registered ${client.commandArray.length} guild command(s) in ${guild.name}.`);
    } else {
      await readyClient.application.commands.set(client.commandArray);
      console.log(`✅ Registered ${client.commandArray.length} global command(s).`);
    }

    client.riffy.init(readyClient.user.id);
    console.log(`🤖 Logged in as ${readyClient.user.tag}`);
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const reply = {
      content: 'There was an error while executing this command.',
      ephemeral: true,
    };

    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

client.on(Events.Raw, (payload) => {
  if (
    ![GatewayDispatchEvents.VoiceStateUpdate, GatewayDispatchEvents.VoiceServerUpdate].includes(
      payload.t,
    )
  )
    return;

  client.riffy.updateVoiceState(payload);
});

client.riffy.on('nodeConnect', (node) => {
  console.log(`🌐 Lavalink node "${node.options.host}" connected.`);
});

client.riffy.on('nodeError', (node, error) => {
  console.log(`⚠️ Lavalink node "${node.options.host}" error: ${error.message}`);
});

client.riffy.on('trackStart', (player, track) => {
  const channel = client.channels.cache.get(player.textChannel);
  if (channel) {
    channel.send(`▶️ Now playing: **${track.info.title}** by **${track.info.author}**`);
  }
});

client.riffy.on('queueEnd', (player) => {
  const channel = client.channels.cache.get(player.textChannel);
  if (channel) {
    channel.send('✅ Queue finished. Leaving the voice channel.');
  }
  player.destroy();
});

client.login(process.env.TOKEN);
