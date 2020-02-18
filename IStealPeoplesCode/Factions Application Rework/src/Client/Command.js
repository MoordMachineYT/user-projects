"use strict";

const Eris = require("eris");

const Client = require("./Client");

class Command {
  /**
   * 
   * @param {Client} client 
   * @param {Object} options
   * @param {String} options.name
   * @param {String} [description="No description"]
   * @param {Number} options.args
   * @param {Number} [options.permissionLevel=0]
   * @param {Boolean} [options.customPermission=false]
   */
  constructor(client, options) {
    this.client = client;
    this.name = options.name;
    this.description = options.description || "No description";
    this.args = options.args;
    this.permissionLevel = options.permissionLevel || 0;
    this.customPermission = options.customPermission === true;
  }
  /**
   * 
   * @param {Eris.Message} msg 
   * @param {String[]} args 
   */
  onCommand(msg, args) { // @ts-ignore
    msg.channel.createMessage("This command has not been configured yet. Please ask **MoordMachineYT#1910** for help if you believe this is a mistake.");
  }
  /**
   * 
   * @param {Eris.Message} msg 
   */
  onIncorrectUsage(msg) {
    msg.channel.createMessage(`You are using this command incorrectly. Please do \`${this.client.prefixes[0]}help ${this.name}\` for help with this command.`);
  }/**
   * 
   * @param {Eris.Message} msg 
   */
  onInvalidPermission(msg) {
    msg.channel.createMessage("You don't have permission to use this command.");
  }
}

module.exports = Command;