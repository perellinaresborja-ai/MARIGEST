const fs = require('fs');
let c = fs.readFileSync('.env', 'utf8');
c = c.replace(/ADMIN_PASSWORD_HASH=".+"/, "ADMIN_PASSWORD_HASH='" + c.match(/ADMIN_PASSWORD_HASH="(.+)"/)[1] + "'");
fs.writeFileSync('.env', c);
