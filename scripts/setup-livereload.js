import fs from 'fs';
import path from 'path';
import { networkInterfaces } from 'os';

// Get local IP address
function getLocalIP() {
  try {
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          if (net.address.startsWith('192.168.') || net.address.startsWith('10.') || net.address.startsWith('172.')) {
            return net.address;
          }
        }
      }
    }
    return 'localhost';
  } catch (error) {
    return 'localhost';
  }
}

// Update capacitor config with local IP
function updateCapacitorConfig() {
  const localIP = getLocalIP();
  const configPath = path.resolve(process.cwd(), 'capacitor.config.ts');
  
  console.log(`🔧 Setting up Live Reload with IP: ${localIP}`);
  
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Replace the IP address in the config
  configContent = configContent.replace(
    /url: 'http:\/\/[^:]+:3000'/g,
    `url: 'http://${localIP}:3000'`
  );
  
  fs.writeFileSync(configPath, configContent);
  console.log(`✅ Updated capacitor.config.ts with IP: ${localIP}`);
}

updateCapacitorConfig();
