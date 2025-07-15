# Dockerfile for dataset pipeline worker
FROM python:3.9-slim
WORKDIR /app
COPY . /app/dataset_pipe
RUN pip install --no-cache-dir pillow imagehash
ENTRYPOINT ["python", "-m", "dataset_pipe.pipeline.run_pipeline"]
