"use strict";

const Eris = require("eris");

const Handler = require("./CommandHandler");
const Metrics = require("./Metrics");

class Client extends Eris.Client {
  constructor(token, options) {
    super(token, {
      getAllUsers: true,
      disableEveryone: false
    });
    this.prefixes = Array.isArray(options.prefixes) && options.prefixes.length !== 0 ? options.prefixes : ["!"];

    this.commandHandler = new Handler(this);
    this.metrics = new Metrics(this);

    this.on("ready", this.onReady).on("messageCreate", this.onMessage);
  }
  onReady() {
    console.log(`I'm ready! Serving ${this.users.size} member(s) in ${this.guilds.size} guild(s).`);
  }
  /**
   * Handles a message
   * @param {Eris.Message} msg 
   */
  onMessage(msg) {
    if(msg.collected) {
      return;
    }
    if(msg.author.bot) {
      return;
    }
    const prefix = this.prefixes.find(pref => msg.content.startsWith(pref));
    if(!prefix) {
      return;
    }
    msg.prefix = prefix;
    const args = msg.content.slice(prefix.length).split(/\s/).filter(Boolean);
    const cmd = args.shift().toLowerCase();
    this.commandHandler.handleCommand(cmd, msg, args);
  }
}

module.exports = Client;