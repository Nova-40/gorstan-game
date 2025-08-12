#!/usr/bin/env node

/**
 * Deployment verification script
 * Checks if the latest version is deployed to the alias
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

// Get current build version
const versionPath = path.join(process.cwd(), 'src/config/version.ts');
const versionContent = fs.readFileSync(versionPath, 'utf8');
const versionMatch = versionContent.match(/BUILD_VERSION = "(\d+)"/);
const expectedVersion = versionMatch ? versionMatch[1] : 'unknown';

console.log(`🔍 Checking deployment for version ${expectedVersion}...`);

// Check the live site
const options = {
  hostname: 'gorstan-game.vercel.app',
  port: 443,
  path: '/',
  method: 'GET',
  headers: {
    'Cache-Control': 'no-cache',
    'User-Agent': 'Deployment-Checker/1.0'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    // Check for asset hash patterns
    const assetMatch = data.match(/assets\/index-([A-Za-z0-9_-]+)\.js/);
    const currentAssetHash = assetMatch ? assetMatch[1] : 'unknown';
    
    console.log(`📦 Current asset hash: ${currentAssetHash}`);
    
    // Get build artifact hash for comparison
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      const distIndexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(distIndexPath)) {
        const distContent = fs.readFileSync(distIndexPath, 'utf8');
        const distAssetMatch = distContent.match(/assets\/index-([A-Za-z0-9_-]+)\.js/);
        const localAssetHash = distAssetMatch ? distAssetMatch[1] : 'unknown';
        
        console.log(`🏠 Local asset hash: ${localAssetHash}`);
        
        if (currentAssetHash === localAssetHash) {
          console.log(`✅ SUCCESS: Latest version ${expectedVersion} is deployed!`);
          console.log(`🌐 Live at: https://gorstan-game.vercel.app`);
          process.exit(0);
        } else {
          console.log(`❌ MISMATCH: Deployment may be outdated`);
          console.log(`💡 Try running: npm run deploy:manual`);
          process.exit(1);
        }
      }
    }
    
    console.log(`ℹ️  Cannot compare with local build. Asset hash: ${currentAssetHash}`);
  });
});

req.on('error', (e) => {
  console.error(`❌ Error checking deployment: ${e.message}`);
  process.exit(1);
});

req.setTimeout(10000, () => {
  console.error('❌ Timeout checking deployment');
  req.destroy();
  process.exit(1);
});

req.end();
