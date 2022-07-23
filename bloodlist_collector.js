const ADDRESS_REGEX = /0x[a-fA-F0-9]{40}/;
const fs = require('fs');
const { MessageAttachment } = require("discord.js");
const BLOODLIST = JSON.parse(fs.readFileSync('./db/bloodlist.json'));

class BloodlistCollector {
  constructor() { }

  handleMessage(message) {
    if (this._matchAddress(message)) {
      this._reply(message);
      this._delete(message);
    };
  }

  respondWithBloodlist(message) {
    const rows = [[`name`, `discord id`, `address`]];

    for (let i = 0; i < Object.keys(BLOODLIST).length; i++) {
      const userId = Object.keys(BLOODLIST)[i];
      rows.push([BLOODLIST[userId]["username"], userId, BLOODLIST[userId]["address"]]);
    }
  
    let csvContent = rows.map(e => e.join(",")).join("\n");

    fs.writeFile('bloodlist.csv', csvContent, 'utf8', function (err) {
      if (err) {
        console.log('Some error occurred - file either not saved or corrupted file saved.');
      } else {
        console.log('Bloodlist saved!');
      }
    });

    const file = new MessageAttachment("bloodlist.csv");

    message.reply({files: [file], content: "The Oracle Speaks:"})
  }
  
  _matchAddress(message) {
    let content = message.content;
    let address;

    if (ADDRESS_REGEX.test(content)) {
      address = content.match(ADDRESS_REGEX)[0];
      BLOODLIST[message.author.id] ||= {};
      BLOODLIST[message.author.id]["address"] = address;
      BLOODLIST[message.author.id]["username"] = message.author.username;
      fs.writeFileSync('./db/bloodlist.json', JSON.stringify(BLOODLIST));
    }

    console.log(`BL: ${message.author.username} added to bloodlist with address ${address}`);
    return address;
  }

  _reply(message) {
    let authorId = message.author.id;
    let address = BLOODLIST[authorId]["address"];

    message.channel.send(`Got you <@${authorId}>, The Oracle has accepted your sacrifice.  Your address is now set to ${this._obfuscate(address)}.`);
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

module.exports = BloodlistCollector;