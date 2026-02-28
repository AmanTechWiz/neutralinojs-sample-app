// ── Tab navigation ──────────────────────────────────
document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
});

// ── Helpers ─────────────────────────────────────────
function card(label, value) {
    return `<div class="info-card">
        <div class="label">${label}</div>
        <div class="value">${value}</div>
    </div>`;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// ── SYSTEM INFO TAB ─────────────────────────────────
async function loadSystemInfo() {
    const el = document.getElementById('system-info');
    el.innerHTML = 'Loading...';
    try {
        const [mem, cpu, os, kernel, arch, displays] = await Promise.all([
            Neutralino.computer.getMemoryInfo(),
            Neutralino.computer.getCPUInfo(),
            Neutralino.computer.getOSInfo(),
            Neutralino.computer.getKernelInfo(),
            Neutralino.computer.getArch(),
            Neutralino.computer.getDisplays()
        ]);

        const display = displays[0] || {};
        const res = display.resolution || {};

        el.innerHTML =
            card('OS', `${os.name} — ${os.description}`) +
            card('Kernel', `${kernel.variant} ${kernel.version}`) +
            card('Architecture', arch) +
            card('CPU', `${cpu.vendor} ${cpu.model}`) +
            card('CPU Cores', `${cpu.physicalCores} cores / ${cpu.logicalThreads} threads`) +
            card('CPU Frequency', `${(cpu.frequency / 1e9).toFixed(2)} GHz`) +
            card('RAM Total', formatBytes(mem.physical.total)) +
            card('RAM Available', formatBytes(mem.physical.available)) +
            card('Virtual Total', formatBytes(mem.virtual.total)) +
            card('Virtual Available', formatBytes(mem.virtual.available)) +
            card('Primary Display', `${res.width || '?'}×${res.height || '?'} @ ${display.refreshRate || '?'}Hz`);
    } catch (e) {
        el.innerHTML = `<pre>Error: ${e.message}</pre>`;
    }
}

// ── FILE SYSTEM TAB ─────────────────────────────────
async function listDirectory() {
    const path = document.getElementById('dir-path').value || NL_PATH;
    const el = document.getElementById('dir-listing');
    try {
        const entries = await Neutralino.filesystem.readDirectory(path);
        el.innerHTML = entries.map(e =>
            `<div class="listing-item"><span class="type">${e.type}</span><span>${e.entry}</span></div>`
        ).join('');
    } catch (e) {
        el.innerHTML = `Error: ${e.message}`;
    }
}

async function browseFolder() {
    try {
        const folder = await Neutralino.os.showFolderDialog('Select a folder');
        if (folder) {
            document.getElementById('dir-path').value = folder;
            listDirectory();
        }
    } catch (e) {
        console.error(e);
    }
}

const TEST_FILE = NL_PATH + '/test_output.txt';

async function writeTestFile() {
    const el = document.getElementById('file-output');
    try {
        const timestamp = new Date().toISOString();
        await Neutralino.filesystem.writeFile(TEST_FILE, `Hello from Neutralino!\nWritten at: ${timestamp}\n`);
        await Neutralino.filesystem.appendFile(TEST_FILE, 'This line was appended.\n');
        const stats = await Neutralino.filesystem.getStats(TEST_FILE);
        el.textContent = `File written & appended successfully.\nPath: ${TEST_FILE}\nSize: ${stats.size} bytes`;
    } catch (e) {
        el.textContent = `Error: ${e.message}`;
    }
}

async function readTestFile() {
    const el = document.getElementById('file-output');
    try {
        const content = await Neutralino.filesystem.readFile(TEST_FILE);
        el.textContent = `Contents of ${TEST_FILE}:\n\n${content}`;
    } catch (e) {
        el.textContent = `Error: ${e.message}`;
    }
}

async function removeTestFile() {
    const el = document.getElementById('file-output');
    try {
        await Neutralino.filesystem.remove(TEST_FILE);
        el.textContent = 'Test file deleted.';
    } catch (e) {
        el.textContent = `Error: ${e.message}`;
    }
}

// ── CLIPBOARD TAB ───────────────────────────────────
async function copyToClipboard() {
    const text = document.getElementById('clip-input').value;
    try {
        await Neutralino.clipboard.writeText(text);
        document.getElementById('clip-output').textContent = 'Copied to clipboard!';
    } catch (e) {
        document.getElementById('clip-output').textContent = `Error: ${e.message}`;
    }
}

async function pasteFromClipboard() {
    try {
        const format = await Neutralino.clipboard.getFormat();
        document.getElementById('clip-format').textContent = `Clipboard format: ${format}`;
        const text = await Neutralino.clipboard.readText();
        document.getElementById('clip-output').textContent = text;
    } catch (e) {
        document.getElementById('clip-output').textContent = `Error: ${e.message}`;
    }
}

// ── OS TOOLS TAB ────────────────────────────────────
async function runCommand() {
    const cmd = document.getElementById('cmd-input').value;
    const el = document.getElementById('cmd-output');
    if (!cmd) { el.textContent = 'Enter a command first.'; return; }
    try {
        const result = await Neutralino.os.execCommand(cmd);
        el.textContent = result.stdOut || result.stdErr || `(exit code: ${result.exitCode})`;
    } catch (e) {
        el.textContent = `Error: ${e.message}`;
    }
}

async function getEnvVar() {
    const key = document.getElementById('env-key').value;
    const el = document.getElementById('env-output');
    if (!key) { el.textContent = 'Enter a variable name first.'; return; }
    try {
        const val = await Neutralino.os.getEnv(key);
        el.textContent = `${key} = ${val || '(not set)'}`;
    } catch (e) {
        el.textContent = `Error: ${e.message}`;
    }
}

async function sendNotification() {
    try {
        await Neutralino.os.showNotification('Hello from Neutralino!',
            'This notification was triggered by the native API.', 'INFO');
    } catch (e) {
        console.error(e);
    }
}

async function showMsgBox() {
    try {
        const choice = await Neutralino.os.showMessageBox(
            'Sample Dialog',
            'Do you like Neutralinojs so far?',
            'YES_NO', 'QUESTION'
        );
        document.getElementById('dialog-output').textContent = `You clicked: ${choice}`;
    } catch (e) {
        document.getElementById('dialog-output').textContent = `Error: ${e.message}`;
    }
}

async function openFileDialog() {
    try {
        const entries = await Neutralino.os.showOpenDialog('Pick a file', {
            filters: [
                { name: 'Text files', extensions: ['txt', 'md', 'json'] },
                { name: 'All files', extensions: ['*'] }
            ]
        });
        document.getElementById('dialog-output').textContent =
            entries.length ? `Selected:\n${entries.join('\n')}` : 'No file selected.';
    } catch (e) {
        document.getElementById('dialog-output').textContent = `Error: ${e.message}`;
    }
}

async function loadKnownPaths() {
    const el = document.getElementById('known-paths');
    const names = ['documents', 'downloads', 'music', 'pictures', 'video', 'temp', 'data', 'config', 'cache'];
    el.innerHTML = '';
    for (const name of names) {
        try {
            const p = await Neutralino.os.getPath(name);
            el.innerHTML += card(name, p);
        } catch (e) {
            el.innerHTML += card(name, `(unavailable)`);
        }
    }
}

// ── WINDOW TAB ──────────────────────────────────────
async function setWindowTitle() {
    const title = document.getElementById('win-title').value || 'Neutralino System Explorer';
    await Neutralino.window.setTitle(title);
}

async function resizeWindow() {
    await Neutralino.window.setSize({ width: 640, height: 480 });
}

async function moveWindow() {
    await Neutralino.window.move(100, 100);
}

let alwaysOnTop = false;
async function toggleAlwaysOnTop() {
    alwaysOnTop = !alwaysOnTop;
    await Neutralino.window.setAlwaysOnTop(alwaysOnTop);
    await Neutralino.os.showNotification('Always on Top',
        alwaysOnTop ? 'Enabled' : 'Disabled');
}

async function getWindowInfo() {
    const el = document.getElementById('win-output');
    try {
        const [size, pos, title] = await Promise.all([
            Neutralino.window.getSize(),
            Neutralino.window.getPosition(),
            Neutralino.window.getTitle()
        ]);
        el.textContent = JSON.stringify({ title, size, position: pos }, null, 2);
    } catch (e) {
        el.textContent = `Error: ${e.message}`;
    }
}

// ── App lifecycle ───────────────────────────────────
function onWindowClose() {
    Neutralino.app.exit();
}

Neutralino.init();
Neutralino.events.on('windowClose', onWindowClose);

document.getElementById('app-meta').textContent =
    `${NL_APPID} | v${NL_VERSION} | ${NL_OS} | port ${NL_PORT}`;

loadSystemInfo();