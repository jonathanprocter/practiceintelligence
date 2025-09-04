#!/usr/bin/env node

/**
 * Deployment Build Script
 * 
 * This script fixes the deployment issue by:
 * 1. Building the client with correct output directory (server/public)
 * 2. Building the server with correct output directory (dist)
 * 3. Ensuring proper directory structure for deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// console.log('🚀 Starting deployment build process...');

// Function to run commands and log output
function runCommand(command, description) {
// console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
// console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

// Function to ensure directory exists
function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
// console.log(`📁 Created directory: ${dirPath}`);
  }
}

// Step 1: Ensure server/public directory exists
// console.log('\n📁 Ensuring correct directory structure...');
ensureDirectory('server/public');
ensureDirectory('dist');

// Step 2: Build client with correct output directory
runCommand(
  'npx vite build --outDir=server/public --emptyOutDir',
  'Building client application to server/public'
);

// Step 3: Build server
runCommand(
  'npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist',
  'Building server application to dist'
);

// Step 4: Verify build output
// console.log('\n🔍 Verifying build output...');

const clientBuildPath = 'server/public';
const serverBuildPath = 'dist';

if (fs.existsSync(path.join(clientBuildPath, 'index.html'))) {
// console.log(`✅ Client build found in ${clientBuildPath}`);
} else {
  console.error(`❌ Client build not found in ${clientBuildPath}`);
  process.exit(1);
}

if (fs.existsSync(path.join(serverBuildPath, 'index.js'))) {
// console.log(`✅ Server build found in ${serverBuildPath}`);
} else {
  console.error(`❌ Server build not found in ${serverBuildPath}`);
  process.exit(1);
}

// console.log('\n🎉 Deployment build completed successfully!');
// console.log('\n📋 Build Summary:');
// console.log(`   Client files: ${clientBuildPath}/`);
// console.log(`   Server files: ${serverBuildPath}/`);
// console.log('\n💡 To start the production server, run: npm start');