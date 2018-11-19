const snekfetch = require("snekfetch");

module.exports = (function (input, extension) {
    return new Promise(function (res, rej) {
        if (!input) rej("Input argument is required.");
        snekfetch.post("https://hasteb.in/documents").send(input).then(body => {
            res("https://hasteb.in/" + body.body.key + ((extension) ? "." + extension : ""));
        }).catch(e => rej(e));
    })
});
