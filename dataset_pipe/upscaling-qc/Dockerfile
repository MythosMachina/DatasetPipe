# Example Dockerfile for upscaling and quality control step
FROM python:3.9-slim
WORKDIR /app
COPY . /app
RUN pip install Pillow
CMD ["python", "upscale.py"]
