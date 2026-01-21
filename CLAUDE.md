# Technical Caveats

## Build Performance

### Critical Build Speed Optimizations
- `eslint.ignoreDuringBuilds: true` - ESLint scanning during build was a major bottleneck
- `typescript.ignoreBuildErrors: true` - Type checking during build significantly slows compilation
- `images.unoptimized: true` - Image optimization adds substantial build time for standalone output
- Removed `--turbo` flag from build script; standard Next.js builder is faster without turbo in this configuration
- `swcMinify: true` - Use SWC minifier for faster minification than Node.js alternatives

### Standalone Output Optimization
- `output: 'standalone'` includes node_modules in .next/standalone, adding ~75MB to intermediate build artifact
- Build script uses `mv` (move) instead of `cp` (copy) for .next/standalone to reduce I/O overhead
- Must explicitly remove node_modules from final dist to keep output lean

### Port Conflicts
- Default port 3000 may already be in use when testing the standalone server
- Use PORT environment variable to override: `PORT=3001 node dist/server.js`
