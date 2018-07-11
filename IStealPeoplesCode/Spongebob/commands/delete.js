const url = require("is-url");

exports = module.exports = async (client, msg, args) => {
  args = args.join(" ");
  if(url(args) || url("https://"+args) && !(await client.db.has(`${msg.guild.id}_${args}`))) {
    const obj = {};
    for(const [key, val] of client.db.entries()) {
      obj[key.split("_")[1]] = val;
    }
    const keys = Object.keys(obj).filter(key => obj[key] === args);
    if(!keys.length) {
      return msg.channel.send("Found 0 keys with that value.");
    }
    keys.forEach(key => client.db.delete(key));
    msg.channel.send(`Deleted the following keys: "${keys.join("\", \"")}"`);
  } else {
    if(!(await client.db.has(`${msg.guild.id}_${args}`))) {
      return msg.channel.send("Key not found.");
    }
    client.db.delete(`${msg.guild.id}_${args}`);
    msg.channel.send(`Successfully deleted ${args}!`);
  }
};
exports.call = "delete"; // The name to call the command with
exports.permLevel = 0; // The permission level
exports.description = ""; // The description
exports.aliases = []; // Any aliases for the command
exports.caseInsensitive = true; // Whether it should be case sensitive
exports.argsRequired = true; // Whether arguments are required for the command to work
exports.enabled = true; // Whether the command is enabled
exports.disabled = (client, msg, args) => "I'm sorry, but this command is disabled."; // Content sent when the command is called but not enabled
exports.invalidUsage = (client, msg, args) => "I'm sorry, but you're using this command incorrectly."; // Content sent when the command is called without arguments but the command requires arguments to work
exports.invalidPerms = (client, msg, args) => "I'm sorry, but you don't have permission to use this command."; // Called when the user doesn't have the required permission for the command