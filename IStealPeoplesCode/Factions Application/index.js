const eris = require("eris");
const fs = require("fs");
const path = require("path");

const config = require("./config.json");

const client = new eris(config.token, {
  restMode: true
});
client.commands = new Map;
client.pending = require("./pending.json");
client.accepted = require("./accepted.json");
client.denied = require("./denied.json");
client.timeouts = {};
client.config = config;
client.invites = [];

fs.readdir(__dirname + "/commands", (err, files) => {
  if(err) throw err;
  for(const file of files.filter(f => f.endsWith(".js"))) {
    const cmd = require(__dirname + "/commands/" + file);
    client.commands.set(cmd.name, cmd);
  }
});

client.on("messageCreate", (msg) => {
  if(!msg.content || !msg.author) return;
  if(!msg.content.startsWith("s!")) return;
  const [cmd, ...args] = msg.content.slice(2).split(/\s/);
  if(!client.commands.has(cmd)) return;
  client.commands.get(cmd).run(client, msg, args);
});

client.on("messageReactionAdd", async(msg, emoji, user) => {
  if(user === client.user.id) return;
  const obj = Object.values(client.pending).find(o => o.message === msg.id);
  if(!obj) return;
  if(emoji.name === "❌") {
    clearTimeout(client.timeouts[obj.user]);
    delete client.timeouts[obj.user];
    client.denied.push(obj.user);
    writeSafe(path.join(__dirname, "./denied.json"), JSON.stringify(client.denied));
    delete client.pending[obj.user];
    writeSafe(path.join(__dirname, "./pending.json"), JSON.stringify(client.pending));
    const user = client.users.get(obj.user) || await client.getRESTUser(obj.user);
    await client.createMessage(msg.channel.id, `Successfully denied **${user.username}#${user.discriminator}**!`);
    try {
      const channel = await client.getDMChannel(obj.user);
      await channel.createMessage("Sorry! You've been denied access into the faction, your application was not good enough :(");
    } catch(err) {} // eslint-disable-line no-empty
  }
  if(emoji.name === "✅") {
    clearTimeout(client.timeouts[obj.user]);
    delete client.timeouts[obj.user];
    const user = client.users.get(obj.user) || await client.getRESTUser(obj.user);
    const invite = await client.createChannelInvite("510587377698471956", {
      unique: true,
      maxUses: 1,
      maxAge: 0
    });
    client.invites.push(invite.code);
    client.accepted[obj.user] = invite.code;
    delete client.pending[obj.user];
    writeSafe(path.join(__dirname, "./pending.json"), JSON.stringify(client.pending));
    writeSafe(path.join(__dirname, "./accepted.json"), JSON.stringify(client.accepted));
    try {
      const channel = await client.getDMChannel(obj.user);
      await channel.createMessage("Congrats! You've been accepted into the faction. Please join using this invite: https://discord.gg/" + invite.code);
      await client.createMessage(msg.channel.id, `Successfully accepted ${user.username}#${user.discriminator}`);
    } catch(err) {
      await client.createMessage(msg.channel.id, `Failed to DM **${user.username}#${user.discriminator}**. Please tell them they can join using **https://discord.gg/${invite.code}**.`);
    }
  }
});

client.on("guildMemberAdd", async(guild, member) => {
  if(guild.id !== "262669086201217024") return;
  const invites = (await guild.getInvites()).map(i => i.code);
  let usedInvite = client.invites.find(i => !invites.includes(i));
  if(usedInvite) {
    const user = Object.keys(client.accepted).find(key => client.accepted[key] === usedInvite);
    if(user && user !== member.id) {
      member.ban();
      guild.banMember(user);
    }
  }
  client.invites = invites;
});

client.once("ready", () => {
  console.log("READY");
  // Continue timeout
  for(const obj of Object.values(client.pending)) {
    if(Date.now() - obj.timestamp >= 86400000) {
      client.getDMChannel(obj.user).then(ch => ch.createMessage("You have been auto-denied due to inactivity from our officers. Feel free to reapply."));
      delete client.pending[obj.user];
    }
    client.timeouts[obj.user] = setTimeout(() => {
      delete client.timeouts[obj.user];
      client.getDMChannel(obj.user).then(ch => ch.createMessage("You have been auto-denied due to inactivity from our officers. Feel free to reapply."));
      delete client.pending[obj.user];
      writeSafe(path.join(__dirname, "./pending.json"), JSON.stringify(client.pending));
    }, obj.timestamp - Date.now() + 86400000);
  }
  writeSafe(path.join(__dirname, "./pending.json"), JSON.stringify(client.pending));
  // No event for invite updates so scheduled update every 5 minutes
  setInterval(async() => {
    const invites = await client.getGuildInvites("262669086201217024");
    client.invites = invites.map(i => i.code);
  }, 300000);
});

client.on("error", console.error);

client.connect();

function writeSafe(path, val) {
  fs.unwatchFile(path, watchListeners[path]);
  fs.writeFileSync(path, val);
  fs.watchFile(path, { persistent: false },watchListeners[path]);
}

exports.writeSafe = writeSafe;

const watchListeners = {
  [path.join(__dirname, "./pending.json")]: function(curr, prev) {
    if(curr.size !== prev.size) {
      client.pending = JSON.parse(fs.readFileSync(path.join(__dirname, "./pending.json")));
    }
  },
  [path.join(__dirname, "./accepted.json")]: function(curr, prev) {
    if(curr.size !== prev.size) {
      client.pending = JSON.parse(fs.readFileSync(path.join(__dirname, "./accepted.json")));
    }
  },
  [path.join(__dirname, "./denied.json")]: function(curr, prev) {
    if(curr.size !== prev.size) {
      client.pending = JSON.parse(fs.readFileSync(path.join(__dirname, "./denied.json")));
    }
  }
};

for(const path in watchListeners) {
  fs.watchFile(path, { persistent: false }, watchListeners[path]);
}