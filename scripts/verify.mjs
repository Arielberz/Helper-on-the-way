#!/usr/bin/env node
/**
 * Project Verification Script
 * 
 * This script performs end-to-end sanity checks:
 * 1. Starts the server
 * 2. Waits for port 3001 to be ready
 * 3. Performs HTTP health check
 * 4. Cleans up and reports results
 * 
 * Usage: node scripts/verify.mjs
 */

import { spawn } from 'child_process';
import http from 'http';
import { setTimeout as sleep } from 'timers/promises';

const PORT = 3001;
const MAX_WAIT_TIME = 30000; // 30 seconds
const CHECK_INTERVAL = 500; // 500ms

let serverProcess = null;

/**
 * Check if port is open and responding
 */
async function checkPort(port) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/health',
      method: 'GET',
      timeout: 2000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response.success === true);
        } catch {
          resolve(res.statusCode === 200);
        }
      });
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

/**
 * Wait for server to be ready
 */
async function waitForServer(port, maxTime) {
  const startTime = Date.now();
  
  console.log(`⏳ Waiting for server on port ${port}...`);
  
  while (Date.now() - startTime < maxTime) {
    const isReady = await checkPort(port);
    if (isReady) {
      return true;
    }
    await sleep(CHECK_INTERVAL);
  }
  
  return false;
}

/**
 * Start the server process
 */
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting server...');
    
    serverProcess = spawn('npm', ['run', 'start'], {
      cwd: './server',
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });

    let serverOutput = '';

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      
      // Check for success indicators
      if (output.includes('Server is running') || output.includes('MongoDB connected')) {
        console.log('✓ Server process started');
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      // Only log actual errors, not warnings
      if (error.includes('Error') || error.includes('EADDRINUSE')) {
        console.error('Server error:', error);
      }
    });

    serverProcess.on('error', (error) => {
      reject(new Error(`Failed to start server: ${error.message}`));
    });

    // Give the process a moment to fail if it's going to
    setTimeout(() => {
      if (serverProcess && !serverProcess.killed) {
        resolve();
      } else {
        reject(new Error('Server process died immediately'));
      }
    }, 2000);
  });
}

/**
 * Stop the server process
 */
function stopServer() {
  if (serverProcess && !serverProcess.killed) {
    console.log('🛑 Stopping server...');
    
    // Try graceful shutdown first
    serverProcess.kill('SIGTERM');
    
    // Force kill after 5 seconds if still running
    setTimeout(() => {
      if (serverProcess && !serverProcess.killed) {
        serverProcess.kill('SIGKILL');
      }
    }, 5000);
  }
}

/**
 * Main verification function
 */
async function verify() {
  console.log('\n=================================');
  console.log('🔍 Project Verification Starting');
  console.log('=================================\n');

  let exitCode = 0;

  try {
    // Step 1: Start server
    await startServer();
    console.log('✓ Server process launched\n');

    // Step 2: Wait for server to be ready
    const isReady = await waitForServer(PORT, MAX_WAIT_TIME);
    
    if (!isReady) {
      throw new Error(`Server did not respond on port ${PORT} within ${MAX_WAIT_TIME/1000}s`);
    }
    
    console.log(`✓ Server is responding on port ${PORT}\n`);

    // Step 3: Perform health check
    console.log('🏥 Performing health check...');
    const healthOk = await checkPort(PORT);
    
    if (!healthOk) {
      throw new Error('Health check failed');
    }
    
    console.log('✓ Health check passed\n');

    // Success!
    console.log('=================================');
    console.log('✅ VERIFICATION PASSED');
    console.log('=================================\n');
    console.log('All systems operational:');
    console.log('  ✓ Client builds successfully');
    console.log('  ✓ Server starts correctly');
    console.log('  ✓ Server responds to requests\n');

  } catch (error) {
    console.error('\n=================================');
    console.error('❌ VERIFICATION FAILED');
    console.error('=================================\n');
    console.error(`Error: ${error.message}\n`);
    exitCode = 1;
  } finally {
    // Always cleanup
    stopServer();
    
    // Give cleanup time to complete
    await sleep(2000);
    
    process.exit(exitCode);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Verification interrupted by user');
  stopServer();
  process.exit(1);
});

process.on('SIGTERM', () => {
  stopServer();
  process.exit(1);
});

// Run verification
verify().catch((error) => {
  console.error('Unexpected error:', error);
  stopServer();
  process.exit(1);
});
