#!/bin/bash

# Wait for PostgreSQL to be ready
until pg_isready -h postgresql -p 5432; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done