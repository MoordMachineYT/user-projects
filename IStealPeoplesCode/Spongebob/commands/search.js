const Discord = require("discord.js");

exports = module.exports = async (client, msg, args) => {
  args = args.join(" ");
  const keys = client.db.keyArray().filter(key => key.startsWith(args));
  if(!keys.length) {
    return msg.channel.send(new Discord.RichEmbed()
      .setTitle("No results")
      .setAuthor("", msg.author.displayAvatarURL)
      .setDescription(`There were no results matching ${args}.`)
      .setColor(0x00FFFF)
      .setThumbnail(client.user.displayAvatarURL)
    );
  }
  let values = await Promise.all(keys.map(key => client.db.get(key)));
  
  const embed = new Discord.RichEmbed()
    .setTitle(values.length + " results")
    .setAuthor("", msg.author.displayAvatarURL)
    .setColor(0x00FFFF)
    .setThumbnail(client.user.displayAvatarURL);
  for(let i = 0; i < Math.min(values.length, 10); i++) {
    embed.addField(keys[i], values[i]);
  }
  msg.channel.send(embed);
};
exports.call = "search"; // The name to call the command with
exports.permLevel = 0; // The permission level
exports.description = ""; // The description
exports.aliases = []; // Any aliases for the command
exports.caseInsensitive = true; // Whether it should be case sensitive
exports.argsRequired = true; // Whether arguments are required for the command to work
exports.enabled = true; // Whether the command is enabled
exports.disabled = (client, msg, args) => "I'm sorry, but this command is disabled."; // Content sent when the command is called but not enabled
exports.invalidUsage = (client, msg, args) => "I'm sorry, but you're using this command incorrectly."; // Content sent when the command is called without arguments but the command requires arguments to work
exports.invalidPerms = (client, msg, args) => "I'm sorry, but you don't have permission to use this command."; // Called when the user doesn't have the required permission for the command