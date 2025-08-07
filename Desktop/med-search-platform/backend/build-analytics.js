// backend/build-analytics.js
const fs = require('fs');
const path = require('path');

class BuildAnalytics {
  static logBuildInfo() {
    const buildInfo = {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      cwd: process.cwd(),
      environment: process.env.NODE_ENV || 'development'
    };
    
    console.log('📊 Build Info:', JSON.stringify(buildInfo, null, 2));
    
    // Ensure dist directory exists
    const distDir = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    // Guardar log de build
    fs.writeFileSync('dist/build-info.json', JSON.stringify(buildInfo, null, 2));
  }
}

BuildAnalytics.logBuildInfo();