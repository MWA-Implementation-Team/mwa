// CSS usage checks (zero deps):
//   a. every class defined in static/style/**/*.css is used in src/**
//   b. every class used in src/** is defined in static/style/**/*.css or static/oat.css
//   c. no style= attributes in src/client/**/*.tsx (activities/ exempt — card art)
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

function walk(dir, exts, out = []) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory() && !['node_modules', 'dist', '.git'].includes(e.name))
            walk(p, exts, out);
        else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
    }
    return out;
}

// Class selectors live in "prelude" text — the chunks that precede a `{`
// (selectors, @media queries) at any depth. Declaration text precedes `}`.
function cssClasses(file) {
    const text = cssText(file);
    const classes = new Set();
    for (const m of text.matchAll(/([^{}]+)\{/g)) {
        const prelude = m[1];
        if (prelude.trimStart().startsWith('@')) continue;
        for (const c of prelude.matchAll(/\.([a-zA-Z_-][\w-]*)/g)) classes.add(c[1]);
    }
    return classes;
}

const appCss = walk(join(ROOT, 'static/style'), ['.css']);
const defined = new Set();
for (const f of appCss) for (const c of cssClasses(f)) defined.add(c);
const definedWithOat = new Set(defined);
for (const c of cssClasses(join(ROOT, 'static/oat.css'))) definedWithOat.add(c);

function cssText(file) {
    return readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/@[\w-]+[^;{}]*;/g, '');
}

// Used classes: class="...", class={'...'}, class={`pre${x}`}, and string
// literals inside class={...} expressions. A `${` cut turns the literal
// prefix into a wildcard (e.g. `mwa-frame--` matches `.mwa-frame--home`).
const used = new Set();
const prefixes = [];
const problems = [];
const ATTR = /class\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g;
const STR = /(['"`])((?:\\.|(?!\1)[^$\\])*?)\1/g;
const TPL_PREFIX = /(['"`])((?:\\.|[^\\])*?)(?=\$\{)/g;

function collect(text) {
    for (const s of text.matchAll(STR))
        for (const tok of s[2].trim().split(/\s+/)) if (tok) used.add(tok);
    for (const s of text.matchAll(TPL_PREFIX))
        for (const tok of s[2].trim().split(/\s+/)) if (tok) prefixes.push(tok);
}

for (const f of walk(join(ROOT, 'src'), ['.ts', '.tsx'])) {
    if (f.endsWith('.test.ts')) continue;
    const rel = relative(ROOT, f);
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(ATTR)) {
        const value = m[1] ?? m[2] ?? m[3];
        if (m[3] === undefined) collect(`'${value}'`);
        else collect(value);
    }
    const lines = src.split('\n');
    lines.forEach((line, i) => {
        if (
            /\bstyle\s*=/.test(line) &&
            rel.startsWith('src/client/') &&
            rel.endsWith('.tsx') &&
            !rel.startsWith('src/client/activities/')
        ) {
            problems.push(`${rel}:${i + 1} inline style= attribute`);
        }
    });
}

for (const f of appCss) {
    const rel = relative(ROOT, f);
    const text = cssText(f);
    for (const m of text.matchAll(/([^{}]+)\{/g)) {
        const prelude = m[1];
        if (prelude.trimStart().startsWith('@')) continue;
        const base = text.slice(0, m.index).split('\n').length - 1;
        for (const c of prelude.matchAll(/\.([a-zA-Z_-][\w-]*)/g)) {
            const line = base + prelude.slice(0, c.index).split('\n').length;
            if (!used.has(c[1]) && !prefixes.some((p) => c[1].startsWith(p)))
                problems.push(`${rel}:${line} unused class .${c[1]}`);
        }
    }
}
for (const c of used) {
    if (!definedWithOat.has(c)) problems.push(`src: undefined class .${c}`);
}

if (problems.length) {
    for (const p of problems) console.log(p);
    process.exit(1);
}
console.log('check-css-usage: ok');
