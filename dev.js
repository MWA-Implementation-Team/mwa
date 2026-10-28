// This is the development script. It starts the server (main.ts)
// and restarts it when any changes are detected, reloading any
// browser tabs that have the site open.

// This file is written in JS instead of TS for older Node versions
// which can't run TS files natively.

import { spawn, exec as execCallback, ChildProcess } from 'child_process';
import { existsSync, watch } from 'fs';
import { promisify } from 'util';
import { createServer, ServerResponse } from 'http';
const exec = promisify(execCallback);

/** @type {ServerResponse[]} */
const connectedWatchers = [];

const reloadServer = createServer((req, res) => {
    if (req.url !== '/watch') {
        res.writeHead(404);
        res.end();
        return;
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Access-Control-Allow-Origin': '*',
    });

    connectedWatchers.push(res);

    req.on('close', () => {
        const idx = connectedWatchers.indexOf(res);
        res.end();
        if (idx === -1) return; // probably cannot happen
        connectedWatchers.splice(idx, 1);
    });
});

reloadServer.listen(3001);

function broadcastReload() {
    for (const watcher of connectedWatchers) {
        watcher.write('data: refresh\n\n');
    }
}

/** @type {ChildProcess} */
let tscWatcher;
/** @type {ChildProcess} */
let server;
let crashTimer;
let crashCount = 0;
// Children we killed on purpose — their 'exit' isn't a crash.
const killedForRestart = new WeakSet();

function startServer() {
    const child = spawn('node', ['--enable-source-maps', './dist/main.js', '--dev'], {
        stdio: ['inherit', 'pipe', 'inherit'],
    });
    server = child;

    child.stdout.pipe(process.stdout);

    let isServerRunning = false;
    let buffer = '';
    child.stdout.on('data', (/** @type {Buffer} */ chunk) => {
        if (isServerRunning) return;
        buffer += chunk.toString();
        if (buffer.includes('Server running')) {
            isServerRunning = true;
            crashCount = 0;
            buffer = '';

            // now we know the server is available, send reload signals to every receiver
            broadcastReload();
        }
    });

    child.once('exit', () => {
        // Nothing respawns a dead server on its own — restart() only fires on
        // tsc output, and if dist/main.js was deleted mid-rebuild this child
        // dies with MODULE_NOT_FOUND. Respawn once the artifact exists again,
        // with backoff for real crash loops (e.g. port in use).
        if (killedForRestart.has(child)) return;
        crashCount++;
        clearTimeout(crashTimer);
        crashTimer = setTimeout(respawnWhenBuilt, Math.min(500 * crashCount, 5000));
    });
}

function respawnWhenBuilt() {
    if (existsSync('./dist/main.js')) {
        restart();
    } else {
        crashTimer = setTimeout(respawnWhenBuilt, 250);
    }
}

async function restart() {
    clearTimeout(crashTimer);
    const old = server;
    // exitCode stays null for signal-killed children — check both, and for an
    // 'exit' that already fired there's nothing to wait on.
    if (old && old.exitCode === null && old.signalCode === null) {
        killedForRestart.add(old);
        const exited = new Promise((resolve) => old.once('exit', resolve));
        old.kill('SIGTERM');
        await exited;
    }
    startServer();
}

function stop() {
    tscWatcher?.kill();
    server?.kill();
    process.exit(0);
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

let jsRuntime = 'npm';
if (process.versions.bun) {
    jsRuntime = 'bun';
    // @ts-expect-error
} else if (typeof Deno !== 'undefined') {
    jsRuntime = 'deno';
}

try {
    await exec(`${jsRuntime} run build`);
} catch {
    // ignore build failure, tsc-watch will report it
}
startServer();

tscWatcher = spawn(jsRuntime, ['run', 'tsc-watch'], {
    stdio: ['inherit', 'pipe', 'inherit'],
});
tscWatcher.stdout.pipe(process.stdout);

/** @type {NodeJS.Timeout} */
let debounceId;

// tsc prints "Found N errors. Watching for file changes." once per completed
// compile — that, not a filesystem watcher on dist/, is the reliable "safe to
// restart" signal. (fs.watch('dist') races: dist is shared with the host via
// the docker bind mount, and `npm test`'s `rm -rf dist` both deletes main.js
// mid-rebuild and kills the inotify watch itself.)
let tscBuffer = '';
tscWatcher.stdout.on('data', (/** @type {Buffer} */ chunk) => {
    tscBuffer += chunk.toString();
    const marker = 'Found 0 errors. Watching for file changes.';
    if (!tscBuffer.includes(marker)) return;
    tscBuffer = '';
    clearTimeout(debounceId);
    debounceId = setTimeout(() => {
        console.log('[dev] Restarting...');
        restart();
    }, 100);
});

watch('static', { recursive: true }, () => {
    // since this is a static file, there is no need to reload the server
    broadcastReload();
});
