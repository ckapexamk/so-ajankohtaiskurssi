# build an image with the Python 3.12 image
FROM python:3.12-slim

# set the working directory to `/app`
WORKDIR /app

# install requirements.txt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy /app
COPY app ./app

# port for the api
EXPOSE 8000

# uvicorn on 0.0.0.0 (port 8000)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]