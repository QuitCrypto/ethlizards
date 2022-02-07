const { Client, Intents } = require("discord.js");
require('dotenv').config();
const LIZARD_GUILD_ID = "897797305883820032";
const WHITELIST_CHANNEL_ID = "939776160571744286";
const ADMIN_CHANNEL_ID = "940306140640735272"
const WhitelistCollector = require('./whitelist_collector.js')

let guild;
let whitelist_collector;

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
  partials: ['MESSAGE', 'REACTION', 'CHANNEL'],
});

client.on('ready', async () => {
  console.log("Lizard awaiting addresses");
  guild = await client.guilds.fetch(LIZARD_GUILD_ID);
})

client.on('messageCreate', async message => {
  if (message.author.bot || message.content[0] !== "!") return;

  const command = message.content.match(/\![a-z]*/)[0];

  if (command !== "!wl" && command !== "!whitelist") return;
  
  whitelist_collector ||= new WhitelistCollector();

  if (message.channel.id === WHITELIST_CHANNEL_ID) {
    whitelist_collector.handleMessage(message);
  } else if (message.channel.id === ADMIN_CHANNEL_ID) {
    whitelist_collector.respondWithWhitelist(message);
  }
});

client.login(process.env.LIZARD_BOT_TOKEN)