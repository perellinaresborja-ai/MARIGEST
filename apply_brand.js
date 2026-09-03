const fs = require('fs');
const path = require('path');

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let content = fs.readFileSync(p, 'utf8');
      
      // We do NOT want to replace 'rose' inside danger alerts or specific hardcoded red things if possible, 
      // but in this app `rose` was used entirely as the primary brand color for Puig Campana.
      // So replacing `rose-` with `brand-` is generally safe for everything.
      
      // But wait! VentasVermut is Puig Campana specific, so it's safe to use brand there too.
      // VentasGranel is Granel specific and uses `emerald-`. If we leave it as `emerald-`, it's fine,
      // but to be perfectly clean, we can replace `emerald-` with `brand-` in VentasGranel too?
      // Actually, leaving `emerald` in VentasGranel is totally fine. We just want the rest of the app 
      // (navbar, dashboard, treasury, clients) to switch from rose to emerald when Granel is active.
      
      // Skip VentasGranel because it already uses emerald
      if (p.includes('VentasGranel')) continue;

      let newContent = content.replace(/rose-/g, 'brand-');
      
      if (content !== newContent) {
        fs.writeFileSync(p, newContent, 'utf8');
        console.log('Updated:', p);
      }
    }
  }
}

walk('src/app');
walk('src/components');
