
# hastebin-gen-2
A npm module for generating hasteb.in links. 
https://www.npmjs.com/package/hastebin-gen-2

## Installation
```npm i -S hastebin-gen-2```

## Example
```
const hastebin = require('hastebin-gen-2');
hastebin("code", "js").then(r => {
    console.log(r); //https://hasteb.in.com/someurl.js
}).catch(console.error);
```

## Devs
Jacz - Original hastebin-gen creator
Jens
