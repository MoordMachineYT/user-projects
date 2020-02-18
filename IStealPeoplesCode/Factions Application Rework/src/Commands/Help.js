"use strict";

const Eris = require("eris");

const BaseCommand = require("../Client/Command");

class Command extends BaseCommand {
  constructor(client) {
    super(client, {
      name: "help",
      description: "Helps users",
      args: false
    });
  }
  /**
   * 
   * @param {Eris.Message} msg 
   * @param {String[]} args 
   */
  onCommand(msg, args) {
    if(!args[0]) {
      let msg = "";
      for(const cmd of this.client.commandHandler.commands.values()) {
        msg += `\`${this.client.prefixes[0] + cmd.name}\` **-** ${cmd.description}`;
      }
      msg.channel.createMessage(msg);
      return;
    }
    const cmd = this.client.commandHandler.commands.get(args[0].toLowerCase());
    if(!cmd) {
      msg.channel.createMessage("Command not found.");
      return;
    }
    msg.channel.createMessage(cmd.description);
  }
}

module.exports = Command;