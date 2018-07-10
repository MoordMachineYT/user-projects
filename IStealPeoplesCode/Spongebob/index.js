/**
* Permission level 0 or omit means everyone has access
* Permission level 1 means users with base permission MANAGE_MESSAGES have permission
* Permission level 2 means users with base permission MANAGE_GUILD have permission
* Permission level 3 means users with base permission ADMINISTRATOR have permission
* Permission level 4 means only the owner of the guild has permission
* Permission level 5 means only the developers of the bot have permission
* Developers can bypass any permission level
* Go to {@link commands/template.txt} for implementation
*/

"use strict";

const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const enmap = require("enmap");
const provider = require("enmap-sqlite");
const config = require("./config.json");
client.aliases = new Discord.Collection();
client.prefixes = config.prefixes; // Leave an array
client.devs = config.devs; // Leave an array
client.commands = new Discord.Collection();
client.db = new enmap({ provider: new provider({ name: "DataStorage"}) });
client.db.defer;
client.utils = require("./utils.js");
client.on("message", msg => { // Handling commands
  if(!msg.author) return;
  if(msg.author.bot) return;
  if(!msg.content) return;
  if(!msg.guild) return;
  if(!msg.channel.permissionsFor(client.user).has("SEND_MESSAGES")) return; // May cause trouble otherwise
  const prefix = client.prefixes.find(pref => msg.content.startsWith(pref));
  if(!prefix) return;
  let [command, ...args] = msg.content.slice(prefix.length).split(" ");
  if(!command) return;
  const cmd = resolveCommand(client, command, args);
  if(!cmd) return;
  if(!cmd.enabled) {
    if(cmd.disabled) msg.channel.send(typeof cmd.disabled === "string" ? cmd.disabled : cmd.disabled(client, msg, args.join(" "))).catch(() => {});
    return;
  }
  if(cmd.argsRequired && !args.length) {
    if(cmd.invalidUsage) msg.channel.send(typeof cmd.invalidUsage === "string" ? cmd.invalidUsage : cmd.invalidUsage(client, msg, args.join(" "))).catch(() => {});
    return;
  }
  if(!getPerms(client, cmd, msg)) {
    if(cmd.invalidPerms) msg.channel.send(typeof cmd.invalidPerms === "string" ? cmd.invalidPerms : cmd.invalidPerms(client, msg, args.join(" "))).catch(() => {});
    return;
  }
  cmd(client, msg, args);
});

// Setting commands
const files = fs.readdirSync(__dirname + "/commands/"); // Replace with '__dirname + "/commands/"' if it doesn't work
files.filter(f => f.endsWith(".js")).forEach(f => {
  const cmd = require(`./commands/${f}`);
  client.commands.set(cmd.call, cmd);
  console.log(`Registered ${f}`);
});

// Resolves commands
function resolveCommand(client, command, args) {
  const call = client.aliases.get(command) || command;
  const commands = client.commands;
  let cmd = commands.get(call);
  if(!cmd) {
    cmd = commands.get(command.toLowerCase());
    if(!cmd || !cmd.caseInsensitive) return;
  }
  return cmd;
}

// Checks if the user may use the command
function getPerms(client, cmd, msg) {
  if(!cmd.permLevel) return true;
  // Developer may always use the command
  if(~client.devs.indexOf(msg.author.id)) return true;
  if(cmd.permLevel === 1) {
    if(msg.member.permissions.has("MANAGE_MESSAGES")) return true;
    return false;
  }
  if(cmd.permLevel === 2) {
    if(msg.member.permissions.has("MANAGE_GUILD")) return true;
    return false;
  }
  if(cmd.permLevel === 3) {
    if(msg.member.permissions.has("ADMINISTRATOR")) return true;
  }
  if(cmd.permLevel === 4) {
    if(msg.guild.ownerID === msg.author.id) return true;
    return false;
  }
  // If the user is a developer then permission should be granted already
  if(cmd.permLevel === 5) return false;
}

client.login(config.token);