# Neutralino System Explorer

A sample desktop app built with [Neutralinojs](https://neutralino.js.org/) to get hands-on with the framework's native APIs. I made this while going through the getting started guide as part of my GSoC 2026 contributor application.

The app is basically a small system dashboard — it pulls hardware info, lets you browse files, mess with the clipboard, run shell commands, and play around with window controls. Nothing fancy, just a way to poke at what Neutralinojs can actually do beyond a hello-world.

## What it covers

- **System Info** — CPU, memory, OS details, display info (`computer.*` namespace)
- **File System** — browse directories, read/write/delete files (`filesystem.*`)
- **Clipboard** — copy and paste text programmatically (`clipboard.*`)
- **OS Tools** — run shell commands, read env vars, trigger native notifications and dialogs (`os.*`)
- **Window Controls** — resize, move, minimize, maximize, toggle always-on-top (`window.*`)

## Running it

You need Node.js and the neu CLI:

```bash
npm install -g @neutralinojs/neu
```

Then from this directory:

```bash
neu run
```

That's it. A window should pop up.

## Building

```bash
neu build --release
```

Binaries go into the `dist/` folder. No compilation step — Neutralinojs just packages the resources with its lightweight runtime.

## Project structure

```
resources/
  index.html      — tabbed UI layout
  styles.css      — dark theme styling
  js/main.js      — all the API demo logic
  js/neutralino.js — client library (auto-managed by neu CLI)
neutralino.config.json — app config and API permissions
```

## Icon credits

- `trayIcon.png` — Made by [Freepik](https://www.freepik.com) from [Flaticon](https://www.flaticon.com)

## License

[MIT](LICENSE)
