-- Create the database
CREATE DATABASE maps
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'C'
    LC_CTYPE = 'C'
    TABLESPACE = pg_default;

-- Connect to the 'maps' database
\c maps;

-- Create the 'markers' table
CREATE TABLE IF NOT EXISTS markers
(
    id serial PRIMARY KEY,
    location point NOT NULL,
    address varchar(256),
    CONSTRAINT markers_location_check CHECK (location IS NOT NULL)
);

-- Set the ownership of the 'markers' table to 'postgres'
ALTER TABLE markers OWNER TO postgres;

-- Create the 'users' table
CREATE TABLE IF NOT EXISTS users
(
    id serial PRIMARY KEY,
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL
);

-- Set the ownership of the 'users' table to 'postgres'
ALTER TABLE users OWNER TO postgres;

-- Create the 'locations' table
CREATE TABLE IF NOT EXISTS locations
(
    id serial PRIMARY KEY,
    user_id integer,
    address varchar(255) NOT NULL,
    location point,
    CONSTRAINT locations_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Set the ownership of the 'locations' table to 'postgres'
ALTER TABLE locations OWNER TO postgres;

-- Create the 'streams' table
CREATE TABLE IF NOT EXISTS streams
(
    id serial PRIMARY KEY,
    location_id integer,
    type varchar(255),
    CONSTRAINT streams_location_id_fkey FOREIGN KEY (location_id)
        REFERENCES locations (id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Set the ownership of the 'streams' table to 'postgres'
ALTER TABLE streams OWNER TO postgres;

-- Create the 'bins' table
CREATE TABLE IF NOT EXISTS bins
(
    id serial PRIMARY KEY,
    stream_id integer,
    volume numeric,
    type varchar(255),
    CONSTRAINT bins_stream_id_fkey FOREIGN KEY (stream_id)
        REFERENCES streams (id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Set the ownership of the 'bins' table to 'postgres'
ALTER TABLE bins OWNER TO postgres;
