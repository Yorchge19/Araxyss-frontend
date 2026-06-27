const fs = require('fs');
const path = require('path');

const filesToProcess = [
  path.join(__dirname, '../app/page.tsx'),
  path.join(__dirname, '../app/negocio/[workspaceId]/page.tsx'),
  path.join(__dirname, '../app/admin/page.tsx')
];

for (const file of filesToProcess) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Fix buttons that have both text-black and text-white due to previous replacements
  content = content.replace(/bg-white text-black text-white/g, 'bg-white text-black');
  content = content.replace(/bg-white text-black hover:bg-gray-200 text-white/g, 'bg-white text-black hover:bg-gray-200');
  content = content.replace(/bg-white text-black hover:bg-gray-200 disabled:opacity-50 text-white/g, 'bg-white text-black hover:bg-gray-200 disabled:opacity-50');
  content = content.replace(/bg-white text-black hover:bg-\[\#6a52e5\] text-white/g, 'bg-white text-black hover:bg-gray-200');
  content = content.replace(/bg-white text-black disabled:opacity-50 disabled:hover:bg-white text-black text-white/g, 'bg-white text-black disabled:opacity-50');
  content = content.replace(/bg-[#222] hover:bg-white text-black text-[#A3A3A3] hover:text-white/g, 'bg-[#222] hover:bg-white text-[#A3A3A3] hover:text-black');
  
  // Fix sidebar active items (prueba 1, prueba 2) in page.tsx
  // the icon is bg-white text-black/10 text-[#8E75FF]
  content = content.replace(/bg-white text-black\/10 text-\[\#8E75FF\]/g, 'bg-[#333] text-white');
  
  // Also check workspace icon indicators which became bg-white text-black
  content = content.replace(/bg-white text-black' : 'bg-white text-black/g, 'bg-white text-black\' : \'bg-[#333] text-white');
  
  fs.writeFileSync(file, content, 'utf8');
}
