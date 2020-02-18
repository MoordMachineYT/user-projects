"use strict";

const fs = require("fs");

const APPLICANTS_FILE = "./applicants.json";
const DENIED_FILE = "./denied.json";
const EX_MEMBERS_FILE = "./exMembers.json";
const MEMBERS_FILE = "./members.json";

let applicantsCache = {};
let cache = {};
let exCache = {};
let deniedCache = {};

module.exports = {
  init() {
    applicantsCache = JSON.parse(fs.readFileSync(APPLICANTS_FILE));
    deniedCache = JSON.parse(fs.readFileSync(DENIED_FILE));
    exCache = JSON.parse(fs.readFileSync(EX_MEMBERS_FILE));
    cache = JSON.parse(fs.readFileSync(MEMBERS_FILE));
  },
  addMember(id, properties) {
    if(properties.position === 0 && cache[id]) {
      console.log("Tried to add a user to MEMBERS_FILE while it is already there!");
      return;
    }
    if(properties.position === 1 && exCache[id]) {
      console.log("Tried to add a user to EX_MEMBERS_FILE while it is already there!");
      return;
    }
    if(properties.position === 2 && applicantsCache[id]) {
      console.log("Tried to add a user to APPLICANTS_FILE while it is already there!");
      return;
    }
    if(properties.position === 3 && deniedCache[id]) {
      console.log("Tried to add a user to DENIED_FILE while it is already there!");
      return;
    }
    const pos = properties.position;
    properties.since = Date.now();
    delete properties.position;
    if(pos === 0) {
      if(applicantsCache[id]) {
        if(applicantsCache[id].application) {
          props.application = applicantsCache[id].application;
        }
        props.previousStates = applicantsCache[id].previousStates || [];
      }
      cache[id] = props;
      fs.writeFileSync(MEMBERS_FILE, JSON.stringify(cache));
      try {
        delete applicantsCache[id];
        fs.writeFileSync(APPLICANTS_FILE, JSON.stringify(applicantsCache));
      } catch(err) {} // eslint-disable-line
    } else if(pos === 1) {
      if(cache[id]) {
        if(cache[id].application) {
          props.application = cache[id].application;
        }
        props.previousStates = [...(cache[id].previousStates || []), cache[id].rank];
      }
      exCache[id] = props;
      fs.writeFileSync(EX_MEMBERS_FILE, JSON.stringify(exCache));
      try {
        delete cache[id];
        fs.writeFileSync(MEMBERS_FILE), JSON.stringify(cache);
      } catch(err) {} // eslint-disable-line
    } else if(pos === 2) {
      if(deniedCache[id]) {
        props.previousStates = [...(deniedCache[id].previousStates || []), deniedCache[id].state];
      } else if(exCache[id]) {
        props.previousStates = [...(exCache[id].previousStates || [], exCache[id].state)];
      }
      applicantsCache[id] = props;
      fs.writeFileSync(APPLICANTS_FILE, JSON.stringify(applicantsCache));
      try {
        delete deniedCache[id];
        fs.writeFileSync(DENIED_FILE, JSON.stringify(deniedCache));
      } catch(err) {} // eslint-disable-line
    } else if(pos === 3) {
      if(applicantsCache[id]) {
        if(applicantsCache[id].application) {
          props.application = applicantsCache[id].application;
        }
        props.previousStates = applicantsCache[id].previousStates || [];
        props.state = 3;
      }
      deniedCache[id] = props;
      fs.writeFileSync(DENIED_FILE, JSON.stringify(deniedCache));
      try {
        delete applicantsCache[id];
        fs.writeFileSync(APPLICANTS_FILE, JSON.stringify(applicantsCache));
      } catch(err) {} // eslint-disable-line
    }
  },
  getMember(id) {
    if(cache[id]) {
      return {
        is: 0,
        obj: cache[id]
      };
    }
    if(exCache[id]) {
      return {
        is: 1,
        obj: exCache[id]
      };
    }
    if(applicantsCache[id]) {
      return {
        is: 2,
        obj: applicantsCache[id]
      };
    }
    if(deniedCache[id]) {
      return {
        is: 3,
        obj: deniedCache[id]
      };
    }
    return null;
  },
  editMember(id, properties) {
    if(cache[id]) {
      Object.assign(cache[id], properties);
      fs.writeFileSync(MEMBERS_FILE, JSON.stringify(cache));
      return;
    }
    if(exCache[id]) {
      Object.assign(exCache[id], properties);
      fs.writeFileSync(EX_MEMBERS_FILE, JSON.stringify(exCache));
      return;
    }
    if(applicantsCache[id]) {
      Object.assign(applicantsCache[id], properties);
      fs.writeFileSync(APPLICANTS_FILE, JSON.stringify(applicantsCache));
      return;
    }
    if(deniedCache[id]) {
      Object.assign(deniedCache[id], properties);
      fs.writeFileSync(DENIED_FILE, JSON.stringify(deniedCache));
    }
    throw new ReferenceError("MEMBER NOT FOUND");
  }
};