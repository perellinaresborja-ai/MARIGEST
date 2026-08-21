const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = "c:\\Users\\perel\\Desktop\\WEBS\\MariGest";
const zipName = "MariGest_Linux_Safe.zip";
const zipPath = path.join(sourceDir, "hostinger", zipName);
const tempDir = path.join(sourceDir, "TEMP_LINUX_ZIP");

if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
fs.mkdirSync(tempDir, { recursive: true });

const folders = ['src', 'public', 'prisma'];
for (const f of folders) {
  if (fs.existsSync(path.join(sourceDir, f))) {
    execSync(`xcopy "${path.join(sourceDir, f)}" "${path.join(tempDir, f)}\\" /E /I /H /Y /Q`);
  }
}
const dbSource = path.join(sourceDir, 'prisma', 'dev.db');
const dbDest = path.join(tempDir, 'prisma', 'dev.db');
if (fs.existsSync(dbSource)) fs.copyFileSync(dbSource, dbDest);

const files = ['package.json', 'package-lock.json', 'next.config.ts', 'components.json', 'postcss.config.mjs', 'eslint.config.mjs', 'tsconfig.json', 'next-env.d.ts'];
for (const f of files) {
  if (fs.existsSync(path.join(sourceDir, f))) fs.copyFileSync(path.join(sourceDir, f), path.join(tempDir, f));
}

// Usar el comando tar nativo de Windows (mucho más compatible con Linux/Hostinger que Compress-Archive)
execSync(`tar -a -c -f "${zipPath}" *`, { cwd: tempDir });

fs.rmSync(tempDir, { recursive: true, force: true });
console.log("ZIP COMPATIBLE CREADO: " + zipPath);
