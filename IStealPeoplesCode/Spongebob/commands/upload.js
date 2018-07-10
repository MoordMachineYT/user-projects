const url = require("is-url");

exports = module.exports = (client, msg, args) => {
  const link = args.pop();
  if(!url(link) && !url("https://"+link)) {
    return msg.channel.send("Invalid url.");
  }
  args = args.join(" ");
  if(!args) {
    return msg.channel.send("No name given.");
  }
  client.db.set(args, link);
  msg.channel.send(`Set ${args} to show: ${link}`);
};
exports.call = "upload"; // The name to call the command with
exports.permLevel = 0; // The permission level
exports.description = ""; // The description
exports.aliases = []; // Any aliases for the command
exports.caseInsensitive = true; // Whether it should be case sensitive
exports.argsRequired = true; // Whether arguments are required for the command to work
exports.enabled = true; // Whether the command is enabled
exports.disabled = (client, msg, args) => "I'm sorry, but this command is disabled."; // Content sent when the command is called but not enabled
exports.invalidUsage = (client, msg, args) => "I'm sorry, but you're using this command incorrectly."; // Content sent when the command is called without arguments but the command requires arguments to work
exports.invalidPerms = (client, msg, args) => "I'm sorry, but you don't have permission to use this command."; // Called when the user doesn't have the required permission for the command