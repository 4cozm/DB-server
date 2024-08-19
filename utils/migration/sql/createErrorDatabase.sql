CREATE DATABASE IF NOT EXISTS ERROR_DB;
USE ERROR_DB;

CREATE TABLE IF NOT EXISTS error_log (
    error_id INT AUTO_INCREMENT PRIMARY KEY,
    error_message TEXT NOT NULL,
    error_code INT NOT NULL,
    error_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    player_id INT
);
