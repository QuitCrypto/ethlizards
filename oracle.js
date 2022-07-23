const { Client, Intents } = require("discord.js");
require('dotenv').config();
const HORROR_GUILD_ID = "874120277758459934";
const BLOODLIST_CHANNEL_ID = "1000172931709669397";
const ADMIN_CHANNEL_ID = "954053042687340586"
const BloodlistCollector = require('./bloodlist_collector.js')

let guild;
let bloodlist_collector;

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
  partials: ['MESSAGE', 'REACTION', 'CHANNEL'],
});

client.on('ready', async () => {
  console.log("The oracle awaits sacrifices");
  guild = await client.guilds.fetch(HORROR_GUILD_ID);
})

client.on('messageCreate', async message => {
  if (message.author.bot || message.content[0] !== "!") return;

  const command = message.content.match(/\![a-z]*/)[0];

  switch(command) {
    case "!bl":
    case "!bloodlist":
      bloodlist_collector ||= new BloodlistCollector();
      if (message.channel.id === BLOODLIST_CHANNEL_ID) {
        bloodlist_collector.handleMessage(message);
      } else if (message.channel.id === ADMIN_CHANNEL_ID) {
        bloodlist_collector.respondWithBloodlist(message);
      }
      break;
    default:
      break;
  }
});

client.login(process.env.HORROR_BOT_TOKEN)