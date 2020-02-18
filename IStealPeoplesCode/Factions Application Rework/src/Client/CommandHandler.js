"use strict";

const Eris = require("eris");

const Client = require("./Client");
const Command = require("./Command");
const Manager = require("../../Storage/Manager");

class Handler {
  /**
   * 
   * @param {Client} client 
   */
  constructor(client) {
    this.client = client;
    this.commands = new Map();
  }
  hasPermission(id, level) {
    if(level === 0) { // 0 = guest
      return true;
    }
    const factionState = Manager.getMember(id);
    if(factionState === null) { // null -> guest and permlevel is at least 1
      // If it was 0 they would be given access already
      return false;
    }
    if(factionState.is === 0) {
      return level >= factionState.obj.rank + 1;
    }
    return false;
  }
  /**
   * 
   * @param {String} cmd 
   * @param {Eris.Message} msg 
   * @param {String[]} args 
   */
  handleCommand(cmd, msg, args) {
    if(!this.commands.has(cmd)) {
      return;
    }
    /**
     * @prop {Command} command
     */
    const command = this.commands.get(cmd);
    if(command.args && args.length === 0) {
      command.onIncorrectUsage(msg);
      return;
    }
    if(command.customPermission) {
      if(!command.hasPermission(msg, args)) {
        command.onInvalidPermission(msg);
        return;
      }
    } else if(!this.hasPermission(msg.author.id, command.permissionLevel)) {
      command.onInvalidPermission(msg);
      return;
    }
    onCommand(msg, args);
  }
}

module.exports = Handler;