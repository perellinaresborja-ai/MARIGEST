const bcrypt = require('bcryptjs');
const password = 'Maria@1976';
const hash = '$2b$10$3iDjBAZ.VY44EXqlAHEf6ea6lyjJh./VFmp2fkk7UOMDwUttbqx0.';
console.log('Match?', bcrypt.compareSync(password, hash));
