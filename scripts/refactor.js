const fs = require('fs');
const path = require('path');

const filesToProcess = [
  path.join(__dirname, '../app/page.tsx'),
  path.join(__dirname, '../app/negocio/[workspaceId]/page.tsx'),
  path.join(__dirname, '../app/admin/page.tsx')
];

const replacements = [
  // Primary brand (Purple)
  { from: /text-\[\#7B61FF\]/g, to: 'text-white' },
  { from: /bg-\[\#7B61FF\]/g, to: 'bg-white text-black' },
  { from: /hover:bg-\[\#6A50E5\]/g, to: 'hover:bg-gray-200' },
  { from: /focus:ring-\[\#7B61FF\]/g, to: 'focus:ring-white' },
  { from: /focus:border-\[\#7B61FF\]/g, to: 'focus:border-white' },
  { from: /bg-\[\#7B61FF\]\/10/g, to: 'bg-white/10' },
  { from: /border-\[\#7B61FF\]/g, to: 'border-white' },

  // Secondary brand (Orange for business, Blue for team, Fuchsia for AI)
  // ONLY replacing strings that are NOT in conditionals for tickets/tasks.
  // We'll replace specific strings first.
  { from: /bg-orange-500 hover:bg-orange-600 text-white/g, to: 'bg-white hover:bg-gray-200 text-black' },
  { from: /bg-orange-600/g, to: 'bg-white text-black' }, // Active space indicator
  { from: /bg-blue-600/g, to: 'bg-white text-black' },   // Agent/AI buttons
  { from: /text-fuchsia-400/g, to: 'text-white' },       // Ask AI
  { from: /text-blue-400/g, to: 'text-white' },          // File icons
  { from: /text-orange-400/g, to: 'text-white' },        // Navigation text
  { from: /hover:text-orange-300/g, to: 'hover:text-gray-300' },
  { from: /hover:text-blue-300/g, to: 'hover:text-gray-300' },
  { from: /hover:border-orange-500/g, to: 'hover:border-white' },
  { from: /focus:border-orange-500/g, to: 'focus:border-white' },
  { from: /hover:border-blue-500/g, to: 'hover:border-white' },
  
  // Specific blocks in Gateway/Onboarding
  { from: /bg-orange-500\/10 text-orange-500 group-hover:bg-orange-500/g, to: 'bg-white/10 text-white group-hover:bg-white group-hover:text-black' },
  { from: /bg-blue-500\/10 text-blue-500 group-hover:bg-blue-500/g, to: 'bg-white/10 text-white group-hover:bg-white group-hover:text-black' },
  { from: /rgba\(249,115,22,0\.3\)/g, to: 'rgba(255,255,255,0.1)' }, // shadow
  { from: /rgba\(59,130,246,0\.3\)/g, to: 'rgba(255,255,255,0.1)' }, // shadow
  
  // Specific Sidebar items
  { from: /bg-orange-500\/10 text-orange-400/g, to: 'bg-white/10 text-white' },
  
  // Bug Reporting view in Business Portal
  { from: /text-red-500 hover:text-white/g, to: 'text-white hover:text-black' },
  { from: /bg-red-500\/20 hover:bg-red-500/g, to: 'bg-white/10 hover:bg-white text-white hover:text-black' },
  { from: /border-red-500\/50/g, to: 'border-white/20' },
  { from: /focus:border-red-500/g, to: 'focus:border-white' },

  // Bot icon
  { from: /bg-gradient-to-tr from-\[\#6A50E5\] to-purple-400 text-white/g, to: 'bg-white text-black' },
  
  // Add transitions to inputs, buttons, and links globally
  { from: /transition-colors/g, to: 'transition-all duration-300' }
];

for (const file of filesToProcess) {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file}, not found.`);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // We want to apply transitions to buttons, let's just make sure transition-all duration-300 is there
  // We'll replace the static transition-colors
  for (const {from, to} of replacements) {
    content = content.replace(from, to);
  }

  // Adding hover:scale-[1.02] to some common button patterns
  content = content.replace(/rounded-xl text-sm font-bold flex items-center transition-all duration-300/g, 'rounded-xl text-sm font-bold flex items-center transition-all duration-300 hover:scale-[1.02]');
  content = content.replace(/rounded-md text-sm font-medium transition-all duration-300/g, 'rounded-md text-sm font-medium transition-all duration-300 hover:scale-[1.02]');
  content = content.replace(/rounded-2xl p-8 text-left transition-all duration-300/g, 'rounded-2xl p-8 text-left transition-all duration-300 hover:scale-[1.02]');
  content = content.replace(/rounded-2xl p-10 text-left transition-all duration-300/g, 'rounded-2xl p-10 text-left transition-all duration-300 hover:scale-[1.02]');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Refactored ${file}`);
  } else {
    console.log(`No changes needed in ${file}`);
  }
}
