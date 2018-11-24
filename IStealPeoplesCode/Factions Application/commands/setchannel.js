const fs = require("fs");
const path = require("path");

const { writeSafe } = require("../");

exports.run = (client, msg, args) => {
  const guild = client.guilds.get("");
  if(!guild.members.has(msg.author.id)) return;
  const member = guild.members.get(msg.author.id);
  const pos = guild.roles.get("510585407654592512").position;
  if(!member.roles.some(r => guild.roles.get(r).position >= pos)) return;
  if(!args[0]|| !args[1]) return;
  let channel = msg.channel.guild.channels.get(msg.channelMentions[0] || args[1]);
  if(!channel) return;
  if(args[0] === "log") {
    client.config.applicationLogChannel = channel.id;
    msg.channel.createMessage("Successfully set the logchannel to " + channel.mention);
  } else if(args[0] === "apply") {
    client.config.applicationChannel = channel.id;
    msg.channel.createMessage("Successfully set the apply channel to " + channel.mention);
  } else {
    return;
  }
  writeSafe(path.join(__dirname, "../config.json"), JSON.stringify(client.config));
};
exports.name = "setchannel";