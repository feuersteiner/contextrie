# CLI Distribution TODO

## Goal
Ship a Bun-built Contextrie CLI as a standalone binary via Homebrew and one Linux registry. No npm publishing.

## Scope
- CLI remains in `cli/` within `feuersteiner/contextrie` monorepo.
- Distribution targets: Homebrew + one Linux registry (Snap or APT).
- Release artifacts are prebuilt binaries per platform.

## Tasks
1) Define CLI package layout and build outputs
   - Add `cli/package.json` with Bun build scripts
   - Add `cli/src/index.ts` entrypoint
   - Define output naming for darwin/linux (arm64/x64)

2) Implement Bun build + release artifacts
   - Configure `bun build` for platform binaries
   - Verify local build and executable runs

3) Homebrew distribution
   - Create `feuersteiner/homebrew-tap` repo
   - Add formula pointing to GitHub Release artifacts
   - Automate formula update with SHA256 in release workflow

4) Linux distribution (pick one)
   - Snap: add `snapcraft.yaml`, publish via Snap Store
   - APT: generate `.deb`, publish to PPA/package host

5) Release workflow
   - GitHub Actions: build binaries on tag
   - Upload artifacts + create GitHub Release
   - Trigger Homebrew formula update

6) Documentation
   - Update `cli/README.md` with install steps (Homebrew + Linux)
   - Add usage examples and config notes
   - Explicitly state: no npm/npx distribution
