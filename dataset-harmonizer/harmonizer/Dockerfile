FROM python:3.8-slim
WORKDIR /app
COPY dataset_harmonizer.py /app/
RUN pip install Pillow tqdm
ENTRYPOINT ["python", "/app/dataset_harmonizer.py"]
