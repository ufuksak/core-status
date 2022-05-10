CREATE USER identity WITH PASSWORD 'passpass';
CREATE USER contacts WITH PASSWORD 'blanks';
CREATE USER status WITH PASSWORD 'statusdb';

CREATE DATABASE identity OWNER identity;
CREATE DATABASE contacts OWNER contacts;
CREATE DATABASE status OWNER status;

# Not sure how to create the exentions in specific databases, yet.
# Run manually for the database that needs it.
# CREATE EXTENSION IF NOT EXISTS pg_trgm;
