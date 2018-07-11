const Discord = require("discord.js");

exports = module.exports = async (client, msg, args) => {
  const setPage = async num => {
    await newMsg.clearReactions();
    embed = new Discord.RichEmbed()
      .setTitle(values.map(val => val.length).reduce((a, b) => a+b, 0) + " result" + (values.map(val => val.length).reduce((a, b) => a+b, 0) === 1 ? "" : "s"))
      .setAuthor("", msg.author.displayAvatarURL)
      .setColor(0x00FFFF)
      .setThumbnail(client.user.displayAvatarURL);
    for(let i = 0; i < Math.min(values[num-1].length, 10); i++) {
      embed.addField(keys[num-1][i], values[num-1][i], true);
    }
    newMsg = await newMsg.edit(embed);
    if(num === 1) {
      await newMsg.react("➡");
    } else if(num < values.length-1) {
      await newMsg.react("⬅");
      await newMsg.react("➡");
    } else {
      await newMsg.react("⬅");
    }
  };
  var keys = client.db.keyArray().filter(key => key.startsWith(msg.guild.id));
  var values = client.utils.split(await Promise.all(keys.map(key => client.db.get(key))), 10);
  keys = client.utils.split(keys.map(key => key.split("_")[1]), 10);
  var embed = new Discord.RichEmbed()
    .setTitle(values.map(val => val.length).reduce((a, b) => a+b, 0) + " result" + (values.map(val => val.length).reduce((a, b) => a+b, 0) === 1 ? "" : "s"))
    .setAuthor("", msg.author.displayAvatarURL)
    .setColor(0x00FFFF)
    .setThumbnail(client.user.displayAvatarURL);
  for(let i = 0; i < Math.min(values[0].length, 10); i++) {
    embed.addField(keys[0][i], values[0][i], true);
  }
  const reactionAdd = (reaction, user) => {
    let changed;
    if(reaction.message.id === newMsg.id && msg.author.id === user.id && (reaction.emoji.name === "⬅" || reaction.emoji.name === "➡")) {
      setPage(reaction.emoji.name === "⬅" ? --page : ++page);
      changed = true;
    }
    if(changed) {
      clearTimeout(timeout);
      timeout = setTimeout(() => client.off("messageReactionAdd", reactionAdd), 30000);
    }
  };
  var newMsg = await msg.channel.send(embed);
  var page = 1;
  var timeout;
  if(values.length > 1) {
    await newMsg.react("➡");
    client.on("messageReactionAdd", reactionAdd);
    timeout = setTimeout(() => client.off("messageReactionAdd", reactionAdd), 30000);
  }
};
exports.call = "list"; // The name to call the command with
exports.permLevel = 0; // The permission level
exports.description = ""; // The description
exports.aliases = []; // Any aliases for the command
exports.caseInsensitive = true; // Whether it should be case sensitive
exports.argsRequired = false; // Whether arguments are required for the command to work
exports.enabled = true; // Whether the command is enabled
exports.disabled = (client, msg, args) => "I'm sorry, but this command is disabled."; // Content sent when the command is called but not enabled
exports.invalidUsage = (client, msg, args) => "I'm sorry, but you're using this command incorrectly."; // Content sent when the command is called without arguments but the command requires arguments to work
exports.invalidPerms = (client, msg, args) => "I'm sorry, but you don't have permission to use this command."; // Called when the user doesn't have the required permission for the command