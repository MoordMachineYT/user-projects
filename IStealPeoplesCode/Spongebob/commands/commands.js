exports = module.exports = async (client, msg, args) => {
  const setPage = async num => {
    await newMsg.removeReactions();
    newMsg = await newMsg.edit({
      embed: {
        title: "Commands | page " + num,
        description: style(commands[num-1], num-1),
        color: 0x00FFFF
      }
    });
    if(num === 1) {
      await newMsg.react("➡");
    } else if(num < commands.length) {
      await newMsg.react("⬅");
      await newMsg.react("➡");
    } else {
      await newMsg.react("⬅");
    }
  };
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
    }
  const commands = client.utils.split(client.commands.filter(c => c.enabled && c.permLevel !== 5).map(c => c.call), 10);
  var newMsg = await msg.channel.send({
    embed: {
      title: "Commands",
      description: style(commands[0], 0),
      color: 0x00FFFF,
    }
  });
  var page = 1;
  var timeout;
  if(commands.length > 1) {
    await newMsg.react("➡");
    client.on("messageReactionAdd", reactionAdd);
    timeout = setTimeout(() => client.off("messageReactionAdd", reactionAdd), 30000);
  }
};
exports.call = "commands";
exports.permLevel = 0;
exports.description = "A list of commands.";
exports.aliases = ["cmds"];
exports.caseInsensitive = true;
exports.argsRequired = false;
exports.enabled = true;
exports.disabled = (client, msg, args) => "nothing";

function style(commands, page) {
  let i = 10*page;
  return commands.map(c => `${++i}. ${c}`).join("\n");;
}
