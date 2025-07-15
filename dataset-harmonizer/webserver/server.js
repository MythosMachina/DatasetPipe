const express = require('express');
const multer = require('multer');
const path = require('path');
const routes = require('./routes');
const Orchestrator = require('./orchestrator');

const app = express();
const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });

app.use(express.json());
app.use('/api', routes);

app.post('/upload', upload.single('dataset'), (req, res) => {
  // TODO: extract zip and start job using orchestrator
  res.json({ message: 'Upload received' });
});

const orchestrator = new Orchestrator();

app.listen(3000, () => {
  orchestrator.initialize();
  console.log('Server listening on port 3000');
});
