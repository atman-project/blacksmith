# Blacksmith

**Your memories you will never lose. Software shifts. Your data shouldn't.**

Blacksmith turns your notes into mini apps. Jot down your thoughts like you would on paper. Chat with Blacksmith to shape them. Before you know it, your notes come alive — and they keep evolving as your needs change. Stop waiting for someone else to build apps that never quite fit.

Blacksmith is part of the [Atman Project](https://github.com/atman-project).

## Philosophy

- **Local-first** — data stays on your device
- **Malleable software** — simple tools, infinite composability
- **Version control for everything** — not just code
- **Data ownership** — own and prove your data

## Getting Started

Install dependencies:

```bash
pnpm install
```

### Web

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Desktop (macOS, Linux, Windows)

Requires the [Rust toolchain](https://www.rust-lang.org/tools/install) and the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS.

```bash
pnpm tauri dev
```

To produce a release bundle:

```bash
pnpm tauri build
```

## License

[AGPL-3.0](LICENSE)

Contributions are welcome! Please read our [Contributor License Agreement](CLA.md) before submitting a PR.
