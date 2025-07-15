const { spawn } = require('child_process');
const path = require('path');
const EventEmitter = require('events');
const AdmZip = require('adm-zip');

class Orchestrator extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map();
  }

  initialize() {
    // Build worker image on startup
    const workerDir = path.join(__dirname, '..', '..', 'dataset_pipe');
    this.runCommand('docker', ['build', '-t', 'dataset-worker', workerDir]);
  }

  startJob(userId, jobId, datasetName, params) {
    const containerName = `${userId}_processing_${jobId}`;
    const composeFile = path.join(__dirname, 'worker-compose.yml');
    // run the worker container and let this class handle cleanup
    const args = ['compose', '-f', composeFile, 'run', '--name', containerName, 'worker', ...params];
    const proc = spawn('docker', args);
    this.jobs.set(jobId, { proc, containerName, datasetName });

    const handleOutput = data => {
      data
        .toString()
        .split(/\r?\n/)
        .forEach(line => {
          if (!line) return;
          const match = line.match(/PROGRESS\s+(\d+)\s+(\d+)/);
          if (match) {
            const current = parseInt(match[1], 10);
            const total = parseInt(match[2], 10);
            this.emit('progress', { jobId, current, total });
          } else {
            this.emit('log', { jobId, line: line.trim() });
          }
        });
    };

    proc.stdout.on('data', handleOutput);
    proc.stderr.on('data', handleOutput);

    proc.on('exit', () => {
      this.jobs.delete(jobId);
      this.cleanContainer(containerName);
      const outDir = path.join(__dirname, '..', 'outputs', jobId);
      const zipFile = path.join(__dirname, '..', 'outputs', `${jobId}.zip`);
      try {
        const zip = new AdmZip();
        zip.addLocalFolder(outDir, '');
        zip.writeZip(zipFile);
      } catch (err) {
        this.emit('log', { jobId, line: `Failed to zip output: ${err.message}` });
      }
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
