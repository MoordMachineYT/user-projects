const EventEmitter = require("events").EventEmitter;
const fs = require("fs");
const haste = require("hastebin-gen-2");
const path = require("path");

const { writeSafe } = require("../");

exports.run = async (client, msg) => {
  if(msg.channel.id !== client.config.applicationChannel) {
    return;
  }
  if(client.pending[msg.author.id]) {
    msg.channel.createMessage("Your application has been recorded. Please wait for a further DM on whether you have been accepted or denied.");
    return;
  }
  if(~client.denied.indexOf(msg.author.id)) {
    msg.channel.createMessage("Sorry! You've been denied access into the faction, your application was not good enough :(");
    return;
  }
  if(~client.accepted.indexOf(msg.author.id)) {
    msg.channel.createMessage("You have already been accepted! Please check your DMs for an invite.");
  }
  try {
    const dmChannel = await msg.author.getDMChannel();
    msg.channel.createMessage("Please check your DMs.");
    await askQuestion(client, msg, dmChannel);
  } catch(err) {
    if(err.code === 50007) {
      msg.channel.createMessage("I'm unable to send you a DM. Please follow these steps: \n3 dots or arrow top left -> Privacy Setting -> Allow direct messages from server members -> Turn on -> Try again.");
    } else {
      msg.channel.createMessage(err.message);
    }
  }
};
exports.name = "apply";

async function askQuestion(client, msg, channel) {
  let answers = [];
  let timedOut = false;
  for(const question of questions) {
    await channel.createMessage(question.question);
    let answer;
    let breaker = false;
    let attempts = 0;
    while(answer === undefined || question.answerMatch(answer) === false) {
      attempts++;
      if(attempts === 5) {
        channel.createMessage("Failed 5 times. Please reapply.");
        return;
      }
      if(answer !== undefined) {
        channel.createMessage(question.invalidAnswer);
      }
      let collected = await waitForMessages(client, channel.id, m => m.author.id !== client.user.id, 1, 60000);
      answer = collected[0];
      if(!answer) {
        breaker = true;
      }
      answer = answer.content;
    }
    if(breaker) {
      channel.createMessage("Timed out.");
      timedOut = true;
      break;
    }
    answers.push({
      name: question.question,
      value: answer
    });
  }
  if(timedOut) {
    return;
  }
  channel.createMessage("Your application has been recorded. Please wait for a further DM on whether you've been accepted or denied.");
  const len = answers.reduce((acc, a) => acc + a.name.length + a.value.length);
  let newMsg;
  if(len > (6000 - msg.author.username.length - 5)) { // Likely never happening but just in case
    content = await haste(JSON.stringify(answers));
    newMsg = await client.createMessage(client.config.applicationLogChannel, {
      embed: {
        author: {
          name: msg.author.username + "#" + msg.author.discriminator,
          icon_url: msg.author.avatarURL
        },
        description: `[Click here](${content}) to view the answers. `
      }
    });
  } else {
    newMsg = await client.createMessage(client.config.applicationLogChannel, {
      embed: {
        author: {
          name: msg.author.username + "#" + msg.author.discriminator,
          icon_url: msg.author.avatarURL
        },
        fields: answers
      }
    });
  }
  await newMsg.addReaction("✅");
  await newMsg.addReaction("❌");
  client.pending[msg.author.id] = {
    message: newMsg.id,
    user: msg.author.id,
    timestamp: Date.now()
  }
  client.timeouts[msg.author.id] = setTimeout(() => {
    delete client.timeouts[msg.author.id];
    channel.createMessage("You have been auto-denied due to inactivity from our officers. Feel free to reapply.");
    client.deleteMessage(client.pending[msg.author.id].message);
    delete client.pending[msg.author.id];
  }, 86400000);
  writeSafe(path.join(__dirname, "../pending.json"), JSON.stringify(client.pending));
}

class MessageCollector extends EventEmitter {
  constructor(client, channel, filter, limit, duration) {
    super();
    this.client = client;
    this.filter = filter;
    this.channel = channel;
    this.limit = limit;
    this.collected = [];
    if(duration) this.timeout = setTimeout(() => this.stop(), duration);
    this.client.on("messageCreate", this.fn = this.onMessage.bind(this));
  }
  onMessage(msg) {
    if(msg.channel.id !== this.channel) {
      return;
    }
    if(!this.filter(msg)) {
      return;
    }
    this.collected.push(msg);
    if(this.collected.length === this.limit) {
      this.stop();
    }
  }
  stop() {
    clearTimeout(this.timeout);
    this.client.removeListener("messageCreate", this.fn);
    this.emit("end");
  }
}

const slice = Function.prototype.call.bind(Array.prototype.slice);
function waitForMessages() {
  const args = slice(arguments);
  const collector = new MessageCollector(...args);
  return new Promise((res) => {
    collector.once("end", () => res(collector.collected));
  });
}

const questions = [{
  question: "What's your IGN?",
  invalidAnswer: "Usernames may only contain alphanumeric characters and underscores.",
  answerMatch: (answer) => /^[\w_]/.test(answer.trim())
}, {
  question: "What's your age?",
  invalidAnswer: "Please submit an age between 12 and 120.",
  answerMatch: (answer) => {
    if(isNaN(answer.trim())) {
      return false;
    }
    const num = Number(answer.trim());
    if(num <= 12 || num >= 120) {
      return false;
    }
    return true;
  }
}, {
  question: "What's your timezone?",
  answerMatch: () => true
}, {
  question: "Playtime per day (in hours)?",
  invalidAnswer: "Please submit a number between 0 and 24.",
  answerMatch: (answer) => isNaN(answer) === false && (answer = Number(answer)) >= 0 && answer <= 24
}, {
  question: "Do you have schematica? (**yes** or **no**)",
  invalidAnswer: "Please answer with **yes** or **no**.",
  answerMatch: (answer) => (answer = answer.trim()) === "yes" || answer === "no"
}, {
  question: "Have you participated in any other big factions? (SPECIFY WHICH ONES)",
  answerMatch: () => true
}, {
  question: "Do you have any skills?",
  answerMatch: () => true
}];