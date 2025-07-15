const express = require('express');
const multer = require('multer');
const path = require('path');
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

app.post('/upload', upload.single('dataset'), (req, res) => {
  const userId = req.session.userId || uuidv4();
  req.session.userId = userId;

  const jobId = uuidv4();
  const args = [
    `/uploads/${path.basename(req.file.path)}`,
    `/outputs/${jobId}`,
    '--dataset_name', req.body.dataset_name || 'dataset',
    '--output_format', req.body.output_format || 'png',
  ];
  if (req.body.auto_resize) args.push('--auto_resize');
  if (req.body.padding) args.push('--padding');

  orchestrator.startJob(userId, jobId, args);

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
  const doneHandler = info => {
    if (info.jobId === jobId) {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      orchestrator.removeListener('progress', progressHandler);
      orchestrator.removeListener('done', doneHandler);
    }
  };

  orchestrator.on('progress', progressHandler);
  orchestrator.on('done', doneHandler);
});

app.listen(3000, () => {
  orchestrator.initialize();
  console.log('Server listening on port 3000');
});
