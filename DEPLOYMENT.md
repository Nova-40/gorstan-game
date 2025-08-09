# Vercel Deployment Guide for Gorstan Game

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard
1. Visit [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import the `gorstan-game` repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel --prod
```

## Configuration

The project is pre-configured for Vercel deployment:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 20.x (specified in package.json)
- **Framework**: Static (Vite + React SPA)

## Environment Variables

Set these in the Vercel dashboard under Project Settings > Environment Variables:

```
NODE_ENV=production
NODE_VERSION=20
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_DEBUG_PANEL=false
```

## Performance Optimizations

✅ **Bundle Splitting**: Separate chunks for vendors, game engine, and logic  
✅ **Asset Optimization**: Terser minification, modern ES target  
✅ **Caching**: Immutable asset caching with cache-busting hashes  
✅ **Security Headers**: XSS protection, content type sniffing prevention  
✅ **SPA Routing**: Proper rewrites for client-side routing  

## Build Size

- **game-engine**: ~289 kB (gzipped: ~86 kB)
- **react-vendor**: ~135 kB (gzipped: ~43 kB)  
- **framer-motion**: ~123 kB (gzipped: ~41 kB)
- **Total**: ~834 kB (gzipped: ~223 kB)

## Post-Deployment

### Performance Monitoring
- Access performance dashboard with `Ctrl+P` during gameplay
- Monitor FPS, memory usage, and render times
- Export performance reports for optimization

### Game Features
- All 200+ rooms with lazy loading
- NPCs with optimized movement system
- Performance-optimized React components
- Real-time state optimization

## Troubleshooting

### Build Failures
- Ensure Node.js 20.x is specified in Vercel settings
- Check that all dependencies are in `package.json`
- Verify TypeScript compilation with `npm run typecheck`

### Performance Issues
- Open performance dashboard (`Ctrl+P`)
- Check for memory leaks or high render times
- Use browser DevTools for detailed profiling

### Asset Loading
- Verify all assets are in `public/` directory
- Check that asset paths use relative URLs
- Confirm lazy loading is working for rooms

## Custom Domain (Optional)

To use a custom domain:
1. Go to Vercel dashboard > Project > Settings > Domains
2. Add your domain name
3. Configure DNS records as instructed
4. SSL certificates are automatically provided

## Monitoring & Analytics

- **Vercel Analytics**: Automatically enabled for performance insights
- **Game Performance**: Built-in dashboard accessible via `Ctrl+P`
- **Error Tracking**: Console errors are captured in production

---

**Ready for Production**: This configuration ensures optimal performance, security, and user experience for the Gorstan text adventure game.
