const form = document.getElementById('upload-form');
const progressSection = document.getElementById('progress');
const statusText = document.getElementById('status');
const bar = document.getElementById('bar');
const log = document.getElementById('log');
const uploadedList = document.getElementById('uploaded-list');
const finishedList = document.getElementById('finished-list');

async function refreshLists() {
  const res = await fetch('/datasets');
  const data = await res.json();
  uploadedList.innerHTML = '';
  data.uploaded.forEach(name => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = 'Start';
    btn.dataset.name = name;
    btn.addEventListener('click', () => startJob(name));
    li.textContent = name + ' ';
    li.appendChild(btn);
    uploadedList.appendChild(li);
  });
  finishedList.innerHTML = '';
  data.finished.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="/download/${item.id}">${item.name}</a>`;
    finishedList.appendChild(li);
  });
}

window.addEventListener('load', refreshLists);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  await fetch('/upload', { method: 'POST', body: formData });
  form.reset();
  refreshLists();
});

async function startJob(name) {
  progressSection.classList.remove('hidden');
  bar.style.width = '0%';
  statusText.textContent = 'Starting...';
  log.textContent = '';
  const res = await fetch('/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  listenProgress(data.jobId);
}

function listenProgress(jobId) {
  const source = new EventSource(`/progress/${jobId}`);
  source.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.progress !== undefined) {
      bar.style.width = `${msg.progress}%`;
      statusText.textContent = `Processing ${msg.progress}%`;
      log.textContent += `Progress ${msg.progress}%\n`;
      log.scrollTop = log.scrollHeight;
    }
    if (msg.log) {
      log.textContent += msg.log + '\n';
      log.scrollTop = log.scrollHeight;
    }
    if (msg.done) {
      statusText.textContent = 'Done!';
      source.close();
      refreshLists();
    }
  };
}
