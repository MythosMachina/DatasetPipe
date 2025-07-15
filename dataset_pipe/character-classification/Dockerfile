# Example Dockerfile for character classification step
FROM python:3.9-slim
WORKDIR /app
COPY . /app
RUN pip install Pillow scikit-learn
CMD ["python", "classify.py"]
