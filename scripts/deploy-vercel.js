#!/usr/bin/env node

/**
 * Vercel Deployment Script
 * 
 * Deploys a Next.js app to Vercel using token from .env file
 * 
 * Usage:
 *   node scripts/deploy-vercel.js <app-name> [--prod]
 * 
 * Example:
 *   node scripts/deploy-vercel.js client
 *   node scripts/deploy-vercel.js client --prod
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get command line arguments
const appName = process.argv[2];
const isProduction = process.argv.includes('--prod');

if (!appName) {
  console.error('❌ Error: App name is required');
  console.error('Usage: node scripts/deploy-vercel.js <app-name> [--prod]');
  console.error('Example: node scripts/deploy-vercel.js client');
  process.exit(1);
}

// Validate app exists
const appPath = path.join(__dirname, '..', 'apps', appName);
if (!fs.existsSync(appPath)) {
  console.error(`❌ Error: App "${appName}" not found at ${appPath}`);
  process.exit(1);
}

// Load .env file from root
const envPath = path.join(__dirname, '..', '.env');
let vercelToken = process.env.VERCEL_TOKEN;

if (!vercelToken && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    const trimmedLine = line.trim();
    // Skip comments and empty lines
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;
    
    const [key, ...valueParts] = trimmedLine.split('=');
    if (key.trim() === 'VERCEL_TOKEN') {
      vercelToken = valueParts.join('=').trim();
      // Remove quotes if present
      vercelToken = vercelToken.replace(/^["']|["']$/g, '');
      break;
    }
  }
}

if (!vercelToken) {
  console.error('❌ Error: VERCEL_TOKEN not found in environment');
  console.error('Please add VERCEL_TOKEN to your .env file');
  process.exit(1);
}

// Build the app first
console.log(`📦 Building ${appName}...`);
try {
  execSync('npm run build', {
    cwd: appPath,
    stdio: 'inherit',
  });
  console.log('✅ Build completed successfully\n');
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

// Deploy to Vercel
console.log(`🚀 Deploying ${appName} to Vercel${isProduction ? ' (production)' : ''}...`);

const deployCommand = isProduction
  ? `vercel --token ${vercelToken} --prod --yes`
  : `vercel --token ${vercelToken} --yes`;

try {
  execSync(deployCommand, {
    cwd: appPath,
    stdio: 'inherit',
    env: {
      ...process.env,
      VERCEL_TOKEN: vercelToken,
    },
  });
  console.log(`\n✅ Successfully deployed ${appName} to Vercel!`);
} catch (error) {
  console.error(`\n❌ Deployment failed for ${appName}`);
  process.exit(1);
}

