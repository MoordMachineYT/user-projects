const util = require("util");

exports.run = async(client, msg, args) => {
  if(msg.author.id !== "392028262965968907") return;
  try {
    let evaled = await eval(args.join(" "));
    msg.channel.createMessage(evaled ? util.inspect(evaled, {depth: +Array.isArray(evaled)}) : String(evaled));
  } catch(err) {
    await msg.channel.createMessage(err.message);
  }
};
exports.name = "eval";