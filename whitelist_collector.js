const ADDRESS_REGEX = /0x[a-fA-F0-9]{40}/;
const fs = require('fs');
const WHITELIST = JSON.parse(fs.readFileSync('./db/whitelist.json'));

class WhitelistCollector {
  constructor() {
  }

  handleMessage(message) {
    if (this._matchAddress(message)) {
      this._reply(message);
      this._delete(message);
    };
  }

  respondWithWhitelist(message) {
    let whitelistStrings = [];

    for (let userId in WHITELIST) {
      let username = WHITELIST[userId]["username"];
      let address = WHITELIST[userId]["address"];
      whitelistStrings.push(`${username} => ${address}`);
    }

    this._splitReply(message, whitelistStrings, "No whitelisted users yet");
  }
  
  _matchAddress(message) {
    let content = message.content;
    let address;

    if (ADDRESS_REGEX.test(content)) {
      address = content.match(ADDRESS_REGEX)[0];
      WHITELIST[message.author.id] ||= {};
      WHITELIST[message.author.id]["address"] = address;
      WHITELIST[message.author.id]["username"] = message.author.username;
      fs.writeFileSync('./db/whitelist.json', JSON.stringify(WHITELIST));
    }

    console.log(`WL: ${message.author.username} added to whitelist with address ${address}`);
    return address;
  }

  _reply(message) {
    let authorId = message.author.id;
    let address = WHITELIST[authorId]["address"];

    message.channel.send(`Got you <@${authorId}>, I've updated your whitelisted address.  Your address is now set to ${this._obfuscate(address)}.`);
  }

  _obfuscate(address) {
    return `${address.slice(0,4)}...${address.slice(-4)}`
  }

  _delete(message) {
    message.delete();
  }

  _splitReply(message, reply, errorMessage) {
    let currentSlice = 0;
  
    if (reply.length === 0) message.reply(errorMessage);
  
    while (currentSlice < reply.length) {
      message.reply(reply.slice(currentSlice,currentSlice + 75).join("\n"))
      currentSlice += 75
    }
  }

}

module.exports = WhitelistCollector;