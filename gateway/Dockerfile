FROM python:3.12.8

WORKDIR /app

COPY ./gateway/app/requirements.txt requirements.txt

RUN pip install -r requirements.txt
RUN pip install fastapi[standard]

EXPOSE 8000

CMD ["fastapi", "run", "--port=8000", "--host=0.0.0.0"]

