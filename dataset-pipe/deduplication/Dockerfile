# Example Dockerfile for deduplication step
FROM python:3.9-slim
WORKDIR /app
COPY . /app
RUN pip install imagehash Pillow
CMD ["python", "deduplicate.py"]
