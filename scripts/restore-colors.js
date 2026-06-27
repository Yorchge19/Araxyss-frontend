const fs = require('fs');
const path = require('path');

const filesToProcess = [
  path.join(__dirname, '../app/page.tsx'),
  path.join(__dirname, '../app/negocio/[workspaceId]/page.tsx'),
  path.join(__dirname, '../app/admin/page.tsx')
];

const replacements = [
  { from: /bg-orange-500\/10 text-white/g, to: 'bg-orange-500/10 text-orange-400' },
  { from: /bg-blue-500\/10 text-white/g, to: 'bg-blue-500/10 text-blue-400' },
  { from: /bg-purple-500\/10 text-white/g, to: 'bg-purple-500/10 text-purple-400' },
  { from: /bg-red-500\/10 text-white/g, to: 'bg-red-500/10 text-red-400' },
  { from: /bg-yellow-500\/10 text-white/g, to: 'bg-yellow-500/10 text-yellow-400' },
];

for (const file of filesToProcess) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  for (const {from, to} of replacements) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(file, content, 'utf8');
}
