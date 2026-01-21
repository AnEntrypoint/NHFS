# Technical Caveats

## Build Process

### Next.js 15.4.3 Invalid Config Options
- `typescript.incremental` is not a valid Next.js config option; incremental compilation is handled internally
- `swcMinify` is not a valid option in Next.js 15; SWC minification is the default and cannot be disabled
- `compress` is not a valid Next.js config option; compression is handled at the server layer

### Standalone Build Optimization
- `output: 'standalone'` includes node_modules in .next/standalone, adding ~75MB to intermediate build artifact
- Build script uses `mv` (move) instead of `cp` (copy) for .next/standalone to reduce I/O overhead on large directories
- Must explicitly remove node_modules from final dist to avoid bloating production build from 144MB to 70MB

### Port Conflicts
- Default port 3000 may already be in use when testing the standalone server
- Use PORT environment variable to override: `PORT=3001 node dist/server.js`
