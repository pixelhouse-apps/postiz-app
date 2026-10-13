#!/bin/sh
# Creates the Postiz and Temporal roles and databases. Temporal's auto-setup
# skips creating a database named after its user, so both are made here.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<SQL
CREATE ROLE postiz LOGIN PASSWORD '$POSTIZ_DB_PASSWORD';
CREATE DATABASE postiz OWNER postiz;
CREATE ROLE temporal LOGIN PASSWORD '$TEMPORAL_DB_PASSWORD';
CREATE DATABASE temporal OWNER temporal;
CREATE DATABASE temporal_visibility OWNER temporal;
SQL
