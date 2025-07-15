const form = document.getElementById('upload-form');
const progressSection = document.getElementById('progress');
const statusText = document.getElementById('status');
const bar = document.getElementById('bar');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  progressSection.classList.remove('hidden');
  bar.style.width = '0%';
  statusText.textContent = 'Uploading...';

  const res = await fetch('/upload', { method: 'POST', body: formData });
  const data = await res.json();
  listenProgress(data.jobId);
});

function listenProgress(jobId) {
  const source = new EventSource(`/progress/${jobId}`);
  source.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.progress !== undefined) {
      bar.style.width = `${msg.progress}%`;
      statusText.textContent = `Processing ${msg.progress}%`;
    }
    if (msg.done) {
      statusText.textContent = 'Done!';
      source.close();
    }
  };
}
