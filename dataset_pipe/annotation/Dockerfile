# Example Dockerfile for annotation step
FROM python:3.9-slim
WORKDIR /app
COPY . /app
RUN pip install Pillow
CMD ["python", "annotate.py"]
