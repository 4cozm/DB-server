CREATE DATABASE IF NOT EXISTS GAME_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE GAME_DB;

CREATE TABLE IF NOT EXISTS score (
    player_id VARCHAR(36) PRIMARY KEY,
    score INT NOT NULL
);

CREATE TABLE IF NOT EXISTS rating (
    player_id VARCHAR(36) ,
    character_id INT,
    win INT,
    lose INT
);

CREATE TABLE IF NOT EXISTS possession (
    possession_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id VARCHAR(36),
    character_id INT DEFAULT 0 CHECK (character_id >= 0 AND character_id <= 15)
);

CREATE TABLE IF NOT EXISTS match_log (
    game_session_id VARCHAR(255) PRIMARY KEY,
    green_player1_id VARCHAR(36),
    green_player2_id VARCHAR(36),
    blue_player1_id VARCHAR(36),
    blue_player2_id VARCHAR(36),
    winner_team VARCHAR(36),
    map_name VARCHAR(36),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS match_history (
    game_session_id VARCHAR(255),
    player_id VARCHAR(36),
    `kill` INT,
    death INT,
    damage INT
);

CREATE TABLE IF NOT EXISTS `character` (
    character_id INT AUTO_INCREMENT PRIMARY KEY,
    character_name VARCHAR(255), 
    hp INT NOT NULL,
    speed FLOAT NOT NULL,
    power FLOAT NOT NULL,
    defense FLOAT NOT NULL,
    critical FLOAT NOT NULL,
    price INT NOT NULL
);

CREATE TABLE IF NOT EXISTS character_skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(255),
    skill_type INT,
    character_id INT,
    damage_factor FLOAT NULL,
    cool_time FLOAT,
    duration FLOAT,
    speed FLOAT,
    range_x FLOAT NULL,
    range_y FLOAT NULL,
    FOREIGN KEY (character_id) REFERENCES `character`(character_id)
);

INSERT INTO `character` (character_name, hp, speed, power, defense, critical, price) VALUES 
("근씨 아저씨", 150, 5.0, 10.0, 0.1, 0.05, 5000),
("원씨 아줌마", 100, 4.0, 12.0, 0.08, 0.1, 5000),
("탱씨 아저씨", 180, 4.0, 8.0, 0.15, 0.05, 5000),
("힐씨 아줌마", 80, 5.0, 10.0, 0.09, 0, 5000);

-- 근씨 아저씨 스킬 데이터 삽입
INSERT INTO character_skills (skill_name, skill_type, character_id, damage_factor, cool_time, duration, speed, range_x, range_y) VALUES
('괭이질', 1, 1, 1, 1, NULL, NULL, 1, 2),
('광폭화', 4, 1, NULL, 15, 5, NULL, NULL, NULL);

-- 원씨 아줌마 스킬 데이터 삽입
INSERT INTO character_skills (skill_name, skill_type, character_id, damage_factor, cool_time, duration, speed, range_x, range_y) VALUES
('씨 뿌리기', 2, 2, 1, 1, NULL, 10, 1.2, 1.2),
('불장판', 5, 2, 2, 15, 3, NULL,  3, 3);

-- 탱씨 아저씨 스킬 데이터 삽입
INSERT INTO character_skills (skill_name, skill_type, character_id, damage_factor, cool_time, duration, speed, range_x, range_y) VALUES
('삽질', 1, 3, 1, 1, NULL, NULL, 1, 2),
('기절기', 7, 3, NULL, 5, 1.5, NULL, 2, 2);

-- 힐씨 아줌마 스킬 데이터 삽입
INSERT INTO character_skills (skill_name, skill_type, character_id, damage_factor, cool_time, duration, speed, range_x, range_y) VALUES
('물 뿌리기', 2, 4, 1, 1, NULL, 10, 1.2, 1.2),
('새참', 5, 4, 1, 5, 3, NULL, 1, 1);


CREATE TABLE IF NOT EXISTS item (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255), 
    item_equip_slot VARCHAR(255),
    item_hp FLOAT NULL,
    item_speed FLOAT NULL,
    item_attack FLOAT NULL,
    item_price INT NOT NULL
);

INSERT INTO item (item_name,item_equip_slot, item_hp, item_speed, item_attack, item_price) VALUES
('칼', '손', NULL, NULL, 5, 5000),
('망토','몸', 20, NULL, NULL, 5000),
('삽','손', 10, NULL, 2, 5000),
('부츠','발', NULL, 0.5,NULL, 5000);