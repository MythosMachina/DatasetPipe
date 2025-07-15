const { spawn } = require('child_process');
const path = require('path');
const EventEmitter = require('events');

class Orchestrator extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map();
  }

  initialize() {
    // Build worker image on startup
    this.runCommand('docker', ['build', '-t', 'dataset-worker', path.join(__dirname, '..', 'harmonizer')]);
  }

  startJob(userId, jobId, params) {
    const containerName = `${userId}_processing_${jobId}`;
    const composeFile = path.join(__dirname, 'worker-compose.yml');
    // run the worker container and let this class handle cleanup
    const args = ['compose', '-f', composeFile, 'run', '--name', containerName, 'worker', ...params];
    const proc = spawn('docker', args);
    this.jobs.set(jobId, proc);

    proc.stdout.on('data', data => {
      data
        .toString()
        .split(/\r?\n/)
        .forEach(line => {
          const match = line.match(/PROGRESS\s+(\d+)\s+(\d+)/);
          if (match) {
            const current = parseInt(match[1], 10);
            const total = parseInt(match[2], 10);
            this.emit('progress', { jobId, current, total });
          }
        });
    });

    proc.on('exit', () => {
      this.jobs.delete(jobId);
      this.cleanContainer(containerName);
      this.emit('done', { jobId });
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
