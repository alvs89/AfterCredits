const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Text color contrast fixes
            content = content.replace(/text-white\/10/g, 'text-white/50');
            content = content.replace(/text-white\/20/g, 'text-white/60');
            content = content.replace(/text-white\/30/g, 'text-white/60');
            content = content.replace(/text-white\/40/g, 'text-white/60');
            content = content.replace(/text-white\/50/g, 'text-white/70');
            
            content = content.replace(/text-neutral-300/g, 'text-neutral-500'); 
            content = content.replace(/text-neutral-400/g, 'text-neutral-600');
            content = content.replace(/text-neutral-500/g, 'text-neutral-600');
            
            // Text opacity classes (not border/bg)
            content = content.replace(/opacity-30/g, 'opacity-60');
            content = content.replace(/opacity-40/g, 'opacity-60');
            content = content.replace(/opacity-50/g, 'opacity-70');
            
            fs.writeFileSync(fullPath, content);
        }
    }
}

processDir('src');
