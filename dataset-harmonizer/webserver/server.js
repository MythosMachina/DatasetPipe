const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const routes = require('./routes');
const Orchestrator = require('./orchestrator');

const app = express();
const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });

app.use(session({
  secret: 'dataset-secret',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', routes);

const orchestrator = new Orchestrator();
const uploadsDir = path.join(__dirname, '..', 'uploads');
const outputsDir = path.join(__dirname, '..', 'outputs');
let uploadedDatasets = [];
let finishedDatasets = [];
const jobFiles = new Map();

app.post('/upload', upload.single('dataset'), (req, res) => {
  const userId = req.session.userId || uuidv4();
  req.session.userId = userId;

  const jobId = uuidv4();
  const datasetName = path.parse(req.file.originalname).name;
  const extractDir = path.join(uploadsDir, datasetName);
  fs.mkdirSync(extractDir, { recursive: true });

  const zip = new AdmZip(req.file.path);
  zip.extractAllTo(extractDir, true);
  fs.unlinkSync(req.file.path);
  uploadedDatasets.push(datasetName);

  const args = [
    `/uploads/${datasetName}`,
    `/outputs/${jobId}`,
    '--dataset_name', req.body.dataset_name || 'dataset',
    '--output_format', req.body.output_format || 'png',
  ];
  if (req.body.auto_resize) args.push('--auto_resize');
  if (req.body.padding) args.push('--padding');

  jobFiles.set(jobId, datasetName);
  orchestrator.startJob(userId, jobId, datasetName, args);

  res.json({ jobId });
});

app.get('/progress/:jobId', (req, res) => {
  const { jobId } = req.params;
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const progressHandler = info => {
    if (info.jobId === jobId) {
      const percent = Math.round((info.current / info.total) * 100);
      res.write(`data: ${JSON.stringify({ progress: percent })}\n\n`);
    }
  };
  const logHandler = info => {
    if (info.jobId === jobId) {
      res.write(`data: ${JSON.stringify({ log: info.line })}\n\n`);
    }
  };
  const doneHandler = info => {
    if (info.jobId === jobId) {
      const name = jobFiles.get(info.jobId);
      if (name) {
        finishedDatasets.push({ id: info.jobId, name });
        uploadedDatasets = uploadedDatasets.filter(n => n !== name);
        jobFiles.delete(info.jobId);
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      orchestrator.removeListener('progress', progressHandler);
      orchestrator.removeListener('log', logHandler);
      orchestrator.removeListener('done', doneHandler);
    }
  };

  orchestrator.on('progress', progressHandler);
  orchestrator.on('log', logHandler);
  orchestrator.on('done', doneHandler);
});

app.get('/datasets', (req, res) => {
  res.json({ uploaded: uploadedDatasets, finished: finishedDatasets });
});

app.get('/download/:jobId', (req, res) => {
  const zipFile = path.join(outputsDir, `${req.params.jobId}.zip`);
  res.download(zipFile);
});

app.listen(3000, () => {
  orchestrator.initialize();
  console.log('Server listening on port 3000');
});
