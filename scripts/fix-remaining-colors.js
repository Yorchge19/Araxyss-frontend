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

  // Replace remaining purple variants
  content = content.replace(/text-\[\#8E75FF\]/g, 'text-black');
  content = content.replace(/hover:text-\[\#8E75FF\]/g, 'hover:text-black');
  
  // Replace the "Home", "Planner", "AI", "Teams" side nav colors
  content = content.replace(/bg-\[\#7B61FF\]\/10 text-\[\#7B61FF\]/g, 'bg-white/10 text-white');
  content = content.replace(/bg-[#7B61FF]\/10 text-[#7B61FF]/g, 'bg-white/10 text-white'); // without brackets
  content = content.replace(/text-purple-500/g, 'text-white');
  content = content.replace(/text-purple-400/g, 'text-white');
  content = content.replace(/bg-purple-500\/10/g, 'bg-white/10');
  content = content.replace(/bg-purple-500\/20/g, 'bg-white/20');
  
  // Replace bugs view red text in sidebar
  content = content.replace(/text-red-400 hover:bg-\[\#2C2C2C\] hover:text-red-300/g, 'text-[#A3A3A3] hover:bg-[#2C2C2C] hover:text-white');
  content = content.replace(/text-red-500 mr-2/g, 'text-white mr-2'); // bugs view title icon

  // Replace remaining text-blue-500 etc. that are not in conditionals
  content = content.replace(/text-blue-500/g, 'text-white');
  content = content.replace(/text-blue-400/g, 'text-white');
  
  // Fix the empty solid white square for workspace icons
  // It looks like: <div className={`rounded p-1 mr-2 flex-shrink-0 ${workspace?.id === ws.id ? 'bg-white text-black' : 'bg-[#333] text-white'}`}></div>
  // We want to put the first letter of ws.name in it.
  content = content.replace(
    /className={`rounded p-1 mr-2 flex-shrink-0 \${workspace\?\.id === ws\.id \? 'bg-white text-black' : 'bg-\[\#333\] text-white'}`}\>\<\/div\>/g,
    'className={`w-5 h-5 rounded flex items-center justify-center mr-2 flex-shrink-0 text-[10px] font-bold ${workspace?.id === ws.id ? \'bg-white text-black\' : \'bg-[#333] text-white\'}`}>{ws.name.charAt(0).toUpperCase()}</div>'
  );

  // Fix the empty solid white square for active space icon in header
  // <div className="w-5 h-5 bg-white text-black rounded flex items-center justify-center mr-2"></div>
  content = content.replace(
    /<div className="w-5 h-5 bg-white text-black rounded flex items-center justify-center mr-2"><\/div>/g,
    '<div className="w-5 h-5 bg-white text-black rounded flex items-center justify-center mr-2 text-[10px] font-bold">{activeSpace?.name?.charAt(0).toUpperCase() || \'S\'}</div>'
  );

  // Fix globalError X button which might be broken
  content = content.replace(/text-red-200 hover:text-white/g, 'text-gray-400 hover:text-white');
  
  // Admin page specifics
  content = content.replace(/bg-red-900\/30 border border-red-500\/50/g, 'bg-white/5 border border-white/20');
  content = content.replace(/text-red-400/g, 'text-white');
  content = content.replace(/text-red-200\/80/g, 'text-[#A3A3A3]');
  content = content.replace(/bg-[#222] hover:bg-red-500\/20/g, 'bg-[#222] hover:bg-white/10');
  
  // Negocio page specifics
  content = content.replace(/bg-red-500\/10 text-red-500/g, 'bg-white/10 text-white'); // Access denied icon
  content = content.replace(/border-red-500/g, 'border-white');
  
  // Clean up any double text-white text-black
  content = content.replace(/text-white text-white/g, 'text-white');
  content = content.replace(/text-black text-black/g, 'text-black');

  // Fix the AI bot icon bg
  content = content.replace(/bg-gradient-to-tr from-\[\#6A50E5\] to-purple-400/g, 'bg-white text-black');

  fs.writeFileSync(file, content, 'utf8');
}
