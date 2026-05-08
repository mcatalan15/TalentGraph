FROM postgres:18-alpine3.23

COPY ./scripts/init_db.sh /docker-entrypoint-initdb.d/

EXPOSE 5432

CMD ["postgres", "-c", "listen_addresses='*'"]