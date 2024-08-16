CREATE DATABASE IF NOT EXISTS MAIN_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE MAIN_DB;

CREATE TABLE Shards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) NOT NULL ,
    shard_number INT NOT NULL,
    `database` VARCHAR(255) NOT NULL,
    `table` VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);