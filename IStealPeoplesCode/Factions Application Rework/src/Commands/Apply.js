"use strict";

const Eris = require("eris");

const BaseCommand = require("../Client/Command");
const Manager = require("../../Storage/Manager");

const WEEK = 1000 * 60 * 60 * 24 * 7;
const DAY  = 1000 * 60 * 60 * 24;
const HOUR = 1000 * 60 * 60;

const QUESTIONS = [
  "What's your in-game username?",
  "What's your age?",
  "What's your timezone?",
  "How long can you play on a daily basis? (hours)",
  "Do you have schematica installed?",
  "What are your skills?",
  "Anything else we should know?"
];
const REQUIREMENTS = [
  Boolean,
  (x) => !isNaN(Number(x.content.trim())),
  Boolean,
  Boolean,
  Boolean,
  Boolean,
  Boolean
];

class Command extends BaseCommand {
  constructor(client) {
    super(client, {
      name: "NAME",
      description: "",
      args: false
    });
  }
  /**
  *
  * @param {Eris.Message} msg
  * @param {String[]} args
  */
  onCommand(msg, args) {
    const factionState = Manager.getMember(msg.author.id);
    if(factionState === null) {
      this.startApplicationProcess(msg.author.id);
      return;
    }
    if(factionState.is(0)) {
      msg.channel.createMessage("You are already part of this faction!");
      return;
    }
    if(factionState.is(1 || 3)) {
      const now = Date.now();
      const a = now - WEEK;
      if(a < factionState.obj.since) {
        let x = 0;
        let binder = "day(s)"
        const difference = factionState.obj.since - a;
        if(difference / DAY <= 1) {
          binder = "hour(s)";
          if(difference / HOUR <= 1) {
            binder = "minute(s)";
            x = Math.ceil(difference / 60000);
          } else {
            x = Math.ceil(difference / HOUR);
          }
        } else {
          x = Math.ceil(difference / DAY);
        }
        msg.channel.createMessage(`You need to wait ${x} ${binder} before applying again!`);
        return;
      }
      this.startApplicationProcess(msg.author.id);
    }
    if(factionState === 2) {
      msg.channel.createMessage("You have already applied! Please wait till your application gets read.");
    }
  }
  async startApplicationProcess(id) {
    const app = [];
    const channel = await this.client.getDMChannel(id);
    for(let i = 0; i < QUESTIONS.length; i++) {
      await channel.createMessage(QUESTIONS[i]);
      const [msg] = await waitForMessages(this.client, channel.id, REQUIREMENTS[i], 1, 60000);
      if(!msg) {
        await channel.createMessage("Timed out. Please re-apply.");
        return;
      }
    }
    channel.createMessage("Thank you for applying! We will read your application soon.");
    const props = {
      position: 2,
      application: app,
      previousStates: []
    };
    Manager.addMember(id, props);
  }
}

class MessageCollector extends EventEmitter {
  /**
   * 
   * @param {Eris.Client} client 
   * @param {String} channel 
   * @param {Function} filter 
   * @param {*} limit 
   * @param {*} duration 
   */
  constructor(client, channel, filter, limit, duration) {
    super();
    this.client = client;
    this.filter = filter;
    this.channel = channel;
    this.limit = limit;
    this.collected = [];
    if(duration) this.timeout = setTimeout(() => this.stop(), duration);
    this.client.prependListener("messageCreate", this.fn = this.onMessage.bind(this));
  }
  onMessage(msg) {
    if(msg.channel.id !== this.channel) {
      return;
    }
    if(!this.filter(msg)) {
      return;
    }
    this.collected.push(msg);
    msg.collected = true;
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

module.exports = Command;