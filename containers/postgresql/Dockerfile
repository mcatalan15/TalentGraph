FROM postgres:18-alpine3.23

ENV TZ=Europe/Paris

COPY ./scripts/* /docker-entrypoint-initdb.d/

EXPOSE 5432

# CMD ["postgres", "-c", "listen_addresses='*'"]