const { spawn } = require('child_process');
const path = require('path');

class Orchestrator {
  constructor() {
    this.jobs = new Map();
  }

  initialize() {
    // Build worker image on startup
    this.runCommand('docker', ['build', '-t', 'dataset-worker', path.join(__dirname, '..', 'harmonizer')]);
  }

  startJob(userId, jobId, params) {
    const containerName = `${userId}_processing_${jobId}`;
    const composeFile = path.join(__dirname, 'worker-compose.yml');
    const proc = spawn('docker', ['compose', '-f', composeFile, 'run', '--name', containerName, 'worker', ...params]);
    this.jobs.set(jobId, proc);
    proc.on('exit', () => {
      this.jobs.delete(jobId);
      this.cleanContainer(containerName);
    });
  }

  cleanContainer(name) {
    this.runCommand('docker', ['rm', name]);
  }

  runCommand(cmd, args) {
    const proc = spawn(cmd, args, { stdio: 'inherit' });
    proc.on('error', err => console.error(`Failed to run ${cmd}:`, err));
  }
}

module.exports = Orchestrator;
