# Technical Caveats

## Build Performance

### Critical Build Speed Optimizations
- `eslint.ignoreDuringBuilds: true` - ESLint scanning during build was a major bottleneck
- `typescript.ignoreBuildErrors: true` - Type checking during build significantly slows compilation
- `images.unoptimized: true` - Image optimization adds substantial build time for standalone output
- Turbopack (`next build --turbopack`) provides 2-5x faster production builds - available in Next.js 15.3+
- `outputFileTracingExcludes` skips tracing dev-only packages (@swc, @esbuild, typescript, eslint, prettier, postcss, tailwindcss)
- `turbotrace` enables faster native dependency tracing with memory limit
- GitHub Actions workflow uses npm cache + Next.js build cache for faster CI
- `legacy-peer-deps=true` in .npmrc required for @heroui peer dependency conflicts in CI

### Standalone Output Optimization
- `output: 'standalone'` includes node_modules in .next/standalone, adding ~75MB to intermediate build artifact
- Build script uses `mv` (move) instead of `cp` (copy) for .next/standalone to reduce I/O overhead
- Must explicitly remove node_modules from final dist to keep output lean

### Build Speed Fundamentals
- Turbopack compilation: ~39.5s minimum (profiled with all optimizations applied)
- Cannot do buildless: requires server-side routes, TypeScript compilation, JSX bundling, static generation, standalone mode
- Vite incompatible: frontend-only bundler without server-side routing or middleware support
- Build time is fundamentally limited by Turbopack's TypeScript+JSX compilation, not configuration
- Further speedups would require framework migration (unfeasible for production app)

### Port Conflicts
- Default port 3000 may already be in use when testing the standalone server
- Use PORT environment variable to override: `PORT=3001 node dist/server.js`
