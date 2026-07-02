FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required for mysqlclient or other python packages if needed
RUN apt-get update && apt-get install -y default-libmysqlclient-dev gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .

EXPOSE 5001

CMD ["gunicorn", "--bind", "0.0.0.0:5001", "app:app"]
