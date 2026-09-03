require('dotenv').config();
const bcrypt = require('bcryptjs');
const hash = process.env.ADMIN_PASSWORD_HASH;
console.log("Hash from env:", hash);
console.log("Starts with $2b$10$?", hash.startsWith('$2b$10$'));
console.log("Compare MariGest2026:", bcrypt.compareSync('MariGest2026', hash));
