CREATE DATABASE IF NOT EXISTS USER_DB;
USE USER_DB;

CREATE TABLE account (
    player_id  VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    pw VARCHAR(255) NOT NULL,
    guild INT NOT NULL,
    create_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE money (
    player_id VARCHAR(255) PRIMARY KEY,
    money INT NOT NULL,
);

