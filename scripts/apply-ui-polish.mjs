import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(__dirname, '..', 'app');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    if (e.name.endsWith('.tsx')) return [p];
    return [];
  });
}

const replacements = [
  [/animate-in fade-in duration-300 flex-1/g, 'ui-view-enter flex-1'],
  [/animate-in fade-in duration-300/g, 'ui-view-enter'],
  [
    /fixed inset-0 z-\[200\] bg-canvas flex items-center justify-center font-sans text-white/g,
    'ui-screen-overlay font-sans text-text-heading',
  ],
  [
    /className="max-w-5xl w-full mx-auto px-6"/g,
    'className="ui-screen-content max-w-5xl"',
  ],
  [
    /className="max-w-4xl w-full mx-auto px-6"/g,
    'className="ui-screen-content max-w-4xl"',
  ],
  [
    /bg-canvas border border-border hover:border-text-heading rounded-2xl p-10 text-left transition-all duration-300 hover:scale-\[1\.02\] hover:-translate-y-2 hover:shadow-\[[^\]]+\] group flex flex-col h-full/g,
    'ui-choice-card p-10 group flex flex-col h-full',
  ],
  [
    /bg-canvas border border-border hover:border-text-heading rounded-2xl p-8 text-left transition-all duration-300 hover:scale-\[1\.02\] hover:-translate-y-2 hover:shadow-\[[^\]]+\] group/g,
    'ui-choice-card p-8 group',
  ],
  [
    /fixed inset-0 bg-black\/60 z-\[100\] flex items-center justify-center p-4 backdrop-blur-sm/g,
    'ui-modal-overlay',
  ],
  [
    /absolute inset-0 z-50 flex items-center justify-center bg-canvas\/80 p-4/g,
    'ui-modal-overlay ui-modal-overlay--nested',
  ],
  [
    /w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin/g,
    'ui-spinner ui-spinner--md',
  ],
  [
    /w-8 h-8 border-4 border-text-heading border-t-transparent rounded-full animate-spin/g,
    'ui-spinner ui-spinner--md',
  ],
  [
    /w-6 h-6 border-2 border-text-heading border-t-transparent rounded-full animate-spin/g,
    'ui-spinner ui-spinner--sm',
  ],
  [
    /animate-\[slideDown_0\.3s_ease-out\]/g,
    'ui-banner-enter',
  ],
  [
    /flex group animate-in slide-in-from-bottom-2 relative/g,
    'flex group ui-message-enter relative',
  ],
  [
    /hover:bg-surface-hover transition-all duration-300/g,
    'ui-list-row transition-colors duration-200',
  ],
  [
    /grid grid-cols-1 \$\{isSuperAdmin \? 'md:grid-cols-3 max-w-5xl' : 'md:grid-cols-2 max-w-2xl'\} gap-8 mx-auto/g,
    "grid grid-cols-1 ${isSuperAdmin ? 'md:grid-cols-3 max-w-5xl' : 'md:grid-cols-2 max-w-2xl'} gap-8 mx-auto ui-stagger",
  ],
  [
    /grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto/g,
    'grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto ui-stagger',
  ],
  [
    /w-16 h-16 bg-white\/10 text-white group-hover:bg-white group-hover:text-black rounded-xl flex items-center justify-center mb-6 transition-all duration-300/g,
    'ui-choice-icon w-16 h-16 bg-white/10 text-text-heading rounded-xl flex items-center justify-center mb-6',
  ],
  [
    /w-14 h-14 bg-white\/10 text-white group-hover:bg-white group-hover:text-black rounded-xl flex items-center justify-center mb-6 transition-all duration-300/g,
    'ui-choice-icon w-14 h-14 bg-white/10 text-text-heading rounded-xl flex items-center justify-center mb-6',
  ],
  [
    /w-16 h-16 bg-surface-hover text-text-heading group-hover:bg-text-heading group-hover:text-white rounded-xl flex items-center justify-center mb-6 transition-all duration-300/g,
    'ui-choice-icon w-16 h-16 bg-surface-hover text-text-heading rounded-xl flex items-center justify-center mb-6',
  ],
  [
    /bg-canvas border border-border rounded-2xl p-8 max-w-md mx-auto relative shadow-2xl/g,
    'ui-modal-panel ui-modal-panel--md p-8 max-w-md mx-auto relative',
  ],
  [
    /bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col relative/g,
    'ui-modal-panel ui-modal-panel--md overflow-hidden flex flex-col relative',
  ],
  [
    /bg-surface border border-border rounded-xl w-full max-w-md shadow-2xl p-6/g,
    'ui-modal-panel ui-modal-panel--md p-6',
  ],
  [
    /bg-surface border border-border rounded-xl w-full max-w-2xl shadow-2xl flex flex-col relative overflow-visible/g,
    'ui-modal-panel ui-modal-panel--xl flex flex-col relative overflow-visible',
  ],
  [
    /absolute top-full left-0 mt-1 w-64 bg-surface border border-border rounded-md shadow-lg py-1 z-50/g,
    'absolute top-full left-0 mt-1 w-64 ui-dropdown py-1 z-50',
  ],
  [
    /absolute top-full left-0 mt-1 w-56 bg-surface border border-border rounded-xl shadow-2xl z-50 py-2/g,
    'absolute top-full left-0 mt-1 w-56 ui-dropdown z-50 py-2',
  ],
  [
    /absolute right-0 mt-2 w-48 bg-surface border border-border rounded-md shadow-lg py-1 z-50/g,
    'absolute right-0 mt-2 w-48 ui-dropdown py-1 z-50',
  ],
  [
    /absolute top-full left-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-xl z-50 p-2/g,
    'absolute top-full left-0 mt-2 w-56 ui-dropdown z-50 p-2',
  ],
  [
    /className="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8"/g,
    'className="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 ui-auth-shell"',
  ],
  [
    /className="bg-surface py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border"/g,
    'className="ui-auth-card py-8 px-4 sm:px-10"',
  ],
  [
    /appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder:text-text-muted focus:outline-none focus:ring-text-heading focus:border-text-heading sm:text-sm bg-canvas text-white transition-all duration-300/g,
    'input-field sm:text-sm',
  ],
  [
    /pb-3 border-b-2 capitalize transition-all duration-300 \$\{newTaskTab === tab \? 'border-white text-white font-medium' : 'border-transparent text-text-muted hover:text-text-body'\}/g,
    "ui-tab ${newTaskTab === tab ? 'ui-tab--active' : 'ui-tab--inactive'}",
  ],
];

const files = walk(appDir);
let count = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  if (file.endsWith('page.tsx') && content.includes('dangerouslySetInnerHTML')) {
    content = content.replace(
      /\s*<style dangerouslySetInnerHTML=\{\{__html: `[\s\S]*?`\}\} \/>\s*/,
      '\n'
    );
  }

  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    count++;
    console.log('Updated:', path.relative(appDir, file));
  }
}

console.log(`\nDone. ${count} file(s) polished.`);
