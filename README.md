# Blacksmith

**Your memories you will never lose. Software shifts. Your data shouldn't.**

Blacksmith turns your notes into mini apps. Jot down your thoughts like you would on paper. Chat with Blacksmith to shape them. Before you know it, your notes come alive — and they keep evolving as your needs change. Stop waiting for someone else to build apps that never quite fit.

Blacksmith is part of the [Atman Project](https://atman.sh).

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

The web build uses an in-browser [iroh](https://www.iroh.computer) node compiled to WebAssembly. Build it once, then start the dev server.

Requires the [Rust toolchain](https://www.rust-lang.org/tools/install), the `wasm32-unknown-unknown` target, and [`wasm-bindgen-cli`](https://github.com/rustwasm/wasm-bindgen):

```bash
rustup target add wasm32-unknown-unknown
cargo install wasm-bindgen-cli
```

**macOS only:** the `ring` crate (a transitive dependency of `iroh`) needs a `clang` with the wasm32 backend, which Apple's bundled clang lacks. Install Homebrew LLVM and point Cargo at it:

```bash
brew install llvm
export CC_wasm32_unknown_unknown="$(brew --prefix llvm)/bin/clang"
export AR_wasm32_unknown_unknown="$(brew --prefix llvm)/bin/llvm-ar"
```

Add those exports to your shell profile if you want them to persist.

Build the WASM module and run the dev server:

```bash
pnpm build:wasm
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
