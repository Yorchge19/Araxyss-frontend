import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(__dirname, '..', 'app');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    if (e.name.endsWith('.tsx') || e.name.endsWith('.ts')) return [p];
    return [];
  });
}

/** Orden: patrones más largos primero */
const replacements = [
  // Fondos
  [/bg-\[#111111\]/g, 'bg-canvas'],
  [/bg-\[#1E1E1E\]/g, 'bg-canvas'],
  [/bg-\[#161616\]/g, 'bg-canvas'],
  [/bg-\[#222222\]/g, 'bg-surface'],
  [/bg-\[#2C2C2C\]/g, 'bg-surface-hover'],
  [/bg-\[#111\]/g, 'bg-canvas'],
  [/bg-\[#222\]/g, 'bg-surface'],
  [/bg-black\/50/g, 'bg-canvas/80'],
  // Hover fondos
  [/hover:bg-\[#222222\]/g, 'hover:bg-surface'],
  [/hover:bg-\[#2C2C2C\]/g, 'hover:bg-surface-hover'],
  [/hover:bg-\[#222\]/g, 'hover:bg-surface'],
  [/hover:bg-gray-200/g, 'hover:bg-btn-primary-hover'],
  [/hover:bg-gray-300/g, 'hover:bg-btn-primary-hover'],
  // Bordes
  [/border-\[#333333\]/g, 'border-border'],
  [/border-\[#333\]/g, 'border-border'],
  [/divide-\[#333\]/g, 'divide-border'],
  [/divide-\[#333333\]/g, 'divide-border'],
  [/ring-\[#111111\]/g, 'ring-canvas'],
  [/ring-\[#1E1E1E\]/g, 'ring-canvas'],
  [/focus:ring-offset-\[#1E1E1E\]/g, 'focus:ring-offset-canvas'],
  [/focus:ring-offset-\[#222222\]/g, 'focus:ring-offset-surface'],
  // Textos
  [/text-\[#E8E8E8\]/g, 'text-text-body'],
  [/text-\[#A3A3A3\]/g, 'text-text-muted'],
  [/text-\[#777\]/g, 'text-text-muted'],
  [/text-\[#555\]/g, 'text-text-muted'],
  [/placeholder-\[#A3A3A3\]/g, 'placeholder:text-text-muted'],
  [/placeholder-\[#777\]/g, 'placeholder:text-text-muted'],
  // Focus
  [/focus:border-white/g, 'focus:border-text-heading'],
  [/focus:ring-white/g, 'focus:ring-text-heading'],
  [/hover:border-white/g, 'hover:border-text-heading'],
  // Acentos → monocromático (excepto error/éxito en alertas)
  [/bg-\[#8E75FF\]\/10/g, 'bg-surface-hover'],
  [/text-\[#8E75FF\]/g, 'text-text-heading'],
  [/bg-\[#FF5A5F\]\/10/g, 'bg-surface-hover'],
  [/text-\[#FF5A5F\]/g, 'text-text-heading'],
  [/hover:border-\[#FF5A5F\]/g, 'hover:border-text-heading'],
  [/group-hover:bg-\[#FF5A5F\]/g, 'group-hover:bg-text-heading'],
  [/group-hover:text-\[#FF5A5F\]/g, 'group-hover:text-text-heading'],
  [/text-\[#FF5A5F\]/g, 'text-text-heading'],
  // Badges de estado/prioridad → escala de grises
  [/bg-orange-500\/10 text-orange-400/g, 'bg-surface-hover text-text-body'],
  [/bg-orange-500\/10 text-white/g, 'bg-surface-hover text-text-heading'],
  [/bg-blue-500\/10 text-white/g, 'bg-surface-hover text-text-heading'],
  [/bg-blue-500\/10 text-blue-400/g, 'bg-surface-hover text-text-body'],
  [/bg-green-500\/10 text-green-400/g, 'bg-surface-hover text-text-heading'],
  [/bg-yellow-500\/10 text-yellow-400/g, 'bg-surface-hover text-text-body'],
  [/bg-yellow-500\/10 text-yellow-500/g, 'bg-surface-hover text-text-body'],
  [/bg-red-500\/10 text-white/g, 'bg-error-muted text-error'],
  [/text-green-400/g, 'text-text-heading'],
  [/text-orange-400/g, 'text-text-body'],
  [/text-yellow-400/g, 'text-text-body'],
  [/text-red-300/g, 'text-error'],
  [/text-yellow-200/g, 'text-text-body'],
  [/text-yellow-100/g, 'text-text-body'],
  [/text-yellow-500/g, 'text-text-heading'],
  [/border-yellow-500\/50/g, 'border-border'],
  [/bg-yellow-500\/10/g, 'bg-surface-hover'],
  [/bg-green-500/g, 'bg-text-heading'],
  [/from-orange-500 via-yellow-500 to-green-500/g, 'from-text-muted via-text-body to-text-heading'],
  [/bg-orange-500/g, 'bg-text-muted'],
  [/text-orange-500/g, 'text-text-body'],
  // Sombras de color → neutras
  [/rgba\(123,97,255,0\.3\)/g, 'rgba(0,0,0,0.15)'],
  [/rgba\(255,90,95,0\.3\)/g, 'rgba(0,0,0,0.15)'],
  [/background=7B61FF/g, 'background=333333'],
  // Segunda pasada — hex residuales
  [/bg-\[#333333\]/g, 'bg-surface-hover'],
  [/hover:bg-\[#333333\]/g, 'hover:bg-surface-hover'],
  [/bg-\[#333\]/g, 'bg-surface-hover'],
  [/hover:bg-\[#333\]/g, 'hover:bg-surface-hover'],
  [/bg-\[#1A1A1A\]/g, 'bg-surface'],
  [/bg-\[#1a1a1a\]/g, 'bg-surface'],
  [/bg-\[#1e1e1e\]/g, 'bg-surface'],
  [/text-\[#666666\]/g, 'text-text-muted'],
  [/bg-\[#666666\]/g, 'bg-text-muted'],
  [/bg-\[#666\]/g, 'bg-text-muted'],
  [/border-\[#A3A3A3\]/g, 'border-border'],
  [/bg-\[#262626\]/g, 'bg-surface-hover'],
  [/bg-\[#2A2A2A\]/g, 'bg-surface-hover'],
  [/bg-\[#2a2a2a\]/g, 'bg-surface-hover'],
  [/bg-\[#2c2c2c\]/g, 'bg-surface-hover'],
  [/bg-\[#2A2A2E\]/g, 'bg-surface-hover'],
  [/hover:bg-\[#3C3C3C\]/g, 'hover:bg-surface-hover'],
  [/border-\[#555555\]/g, 'border-border-subtle'],
  [/hover:border-\[#555555\]/g, 'hover:border-border-subtle'],
  [/border-\[#3A3A3A\]/g, 'border-border'],
  [/border-\[#3A3A3E\]/g, 'border-border'],
  [/ring-\[#222222\]/g, 'ring-surface'],
  [/border-\[#444\]/g, 'border-border'],
  [/border-\[#8E75FF\]/g, 'border-text-heading'],
  [/border-orange-500\/30/g, 'border-border'],
  [/bg-\[#6A50E5\]/g, 'bg-text-heading'],
  [/text-\[#888\]/g, 'text-text-muted'],
  [/text-\[#E0E0E0\]/g, 'text-text-body'],
  [/placeholder-\[#555\]/g, 'placeholder:text-text-muted'],
  [/text-\[#333\]/g, 'text-border'],
  [/stroke="#333333"/g, 'stroke="var(--border-subtle)"'],
  [/background: #444/g, 'background: var(--border-subtle)'],
  [/background: #666/g, 'background: var(--text-muted)'],
  [/bg-blue-500\/20 text-white/g, 'bg-surface-hover text-text-heading'],
  [/bg-blue-500/g, 'bg-text-muted'],
  [/bg-purple-500/g, 'bg-text-muted'],
  [/bg-yellow-500/g, 'bg-text-muted'],
  [/bg-red-500(?!\/)/g, 'bg-error'],
  [/bg-blue-400/g, 'bg-text-muted'],
  [/bg-orange-400/g, 'bg-text-body'],
  [/bg-purple-400/g, 'bg-text-muted'],
  [/bg-green-400/g, 'bg-text-heading'],
  [/fill-yellow-500/g, 'fill-text-muted'],
  [/fill-blue-500/g, 'fill-text-muted'],
  [/fill-red-500/g, 'fill-error'],
  [/text-green-500/g, 'text-success'],
  [/text-green-500\/70/g, 'text-success/70'],
  [/border-green-500/g, 'border-success'],
  [/border-green-500\/20/g, 'border-success/20'],
  [/text-green-500 border-green-500\/20/g, 'text-success border-success/20'],
  [/stroke="#22c55e"/g, 'stroke="var(--success)"'],
  // Tercera pasada
  [/bg-\[#0A0A0A\]/g, 'bg-canvas'],
  [/border-\[#222\]/g, 'border-border'],
  [/divide-\[#1A1A1A\]/g, 'divide-border'],
  [/from-\[#222\] to-\[#111\]/g, 'from-surface-hover to-canvas'],
  [/from-\[#333\] to-\[#222\]/g, 'from-surface-hover to-surface'],
  [/decoration-\[#555\]/g, 'decoration-text-muted'],
  [/text-\[#444\]/g, 'text-text-muted'],
  [/placeholder-\[#333\]/g, 'placeholder:text-text-muted'],
  [/bg-\[#A3A3A3\]/g, 'bg-text-muted'],
  [/hover:bg-\[#444\]/g, 'hover:bg-surface-hover'],
  [/text-\[#333333\]/g, 'text-border'],
  [/bg-\[#555\]/g, 'bg-text-muted'],
  [/text-\[#666\]/g, 'text-text-muted'],
  [/fill-\[#666\]/g, 'fill-text-muted'],
  [/text-\[#666\]/g, 'text-text-muted'],
  [/bg-\[#2a2310\]/g, 'bg-surface-hover'],
  [/text-\[#d6c7a1\]/g, 'text-text-muted'],
  [/ctx\.strokeStyle = '#E8E8E8'/g, "ctx.strokeStyle = '#E0E0E0'"],
  [/radial-gradient\(#333/g, 'radial-gradient(var(--border-subtle)'],
];

const files = walk(appDir);
let total = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }
  if (content !== original) {
    fs.writeFileSync(file, content);
    total++;
    console.log('Updated:', path.relative(appDir, file));
  }
}

console.log(`\nDone. ${total} file(s) updated.`);
