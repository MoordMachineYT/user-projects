"use strict";

const fs = require("fs");

const Client = require("./Client");

class Metrics {
  /**
   * 
   * @param {Client} client 
   */
  constructor(client) {
    this.client = client;
    this.prefixes = {};
    this.commands = {};
    for(const a of this.client.prefixes) {
      this.prefixes[a] = 0;
    }
    for(const [a] of this.client.commandHandler.commands) {
      this.commands[a] = 0;
    }
  }
  init() {
    const data = JSON.parse(fs.readFileSync("../../metrics.json"));
    for(const a in data.prefixes) {
      this.prefixes[a] = data.prefixes[a];
    }
    for(const a in data.commands) {
      this.commands[a] = data.commands[a];
    }
  }
  prefix(prefix) {

  }
}

module.exports = Metrics;