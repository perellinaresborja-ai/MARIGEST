const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'app', 'actions');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));
for (const file of files) {
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');
  if (content.includes('"use server";')) {
    content = content.replace(/"use server";\s*/g, '');
    content = '"use server";\n' + content;
    fs.writeFileSync(filepath, content);
  }
}
console.log('Fixed use server directives.');
