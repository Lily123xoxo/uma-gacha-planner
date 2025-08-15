CREATE DATABASE IF NOT EXISTS uma_banner_schedule;
USE uma_banner_schedule;

DROP TABLE IF EXISTS character_banner;
DROP TABLE IF EXISTS support_banner;

CREATE TABLE IF NOT EXISTS character_banner (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uma_name VARCHAR(255) NOT NULL,
    jp_release_date DATE,
    global_actual_date DATE,
    global_est_date DATE DEFAULT NULL,
    jp_days_until_next INT,
    global_days_until_next INT,
    image_path VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS support_banner (
    id INT AUTO_INCREMENT PRIMARY KEY,
    support_name VARCHAR(255) NOT NULL,
    jp_release_date DATE,
    global_actual_date DATE,
    global_est_date DATE DEFAULT NULL,
    jp_days_until_next INT,
    global_days_until_next INT,
    image_path VARCHAR(255)
);

INSERT INTO character_banner
(uma_name, jp_release_date, global_actual_date, jp_days_until_next, global_days_until_next)
VALUES
('Uma Launch Banner', '2021-02-24', '2025-06-25', 5, 0),
('TM Opera O (Original)', '2021-03-01', '2025-06-25', 7, 7),
('Mihono Bourbon (Original)', '2021-03-08', '2025-07-02', 9, 8),
('Biwa Hayahide (Original)', '2021-03-17', '2025-07-10', 12, 6),
('Tokai Teio & Mejiro McQueen (Anime Collab)', '2021-03-29', '2025-07-16', 16, 11),
('Curren Chan (Original)', '2021-04-14', '2025-07-27', 11, 7),
('Narita Taishin (Original)', '2021-04-25', '2025-03-08', 10, 8),
('Smart Falcon (Original)', '2021-05-05', '2025-08-11', 11, 9),
('Narita Brian (Original)', '2021-05-16', '2025-08-20', 11, 8),
('Mayano Top Gun & Air Groove (Wedding)', '2021-05-27', '2025-08-28', 13, NULL),
('Seiun Sky (Original)', '2021-06-09', '2025-09-06', 11, NULL),
('Hishi Amazon (Original)', '2021-06-20', '2025-09-13', 8, NULL),
('El Condor Pasa & Grass Wonder (Fantasy)', '2021-06-28', '2025-09-19', 13, NULL),
('Fuji Kiseki (Original)', '2021-07-11', '2025-09-28', 8, NULL),
('Gold City (Original)', '2021-07-19', '2025-10-03', 9, NULL),
('Special Week & Maruzensky (Summer)', '2021-07-28', '2025-10-10', 13, NULL),
('Meisho Doto (Original)', '2021-08-10', '2025-10-19', 9, NULL),
('Eishin Flash (Original)', '2021-08-19', '2025-10-25', 10, NULL),
('Matikanefukukitaru (Full Armor)', '2021-08-29', '2025-11-01', 11, NULL),
('Hishi Akebono (Original)', '2021-09-09', '2025-11-09', 10, NULL),
('Agnes Digital (Original)', '2021-09-19', '2025-11-16', 9, NULL),
('Rice Shower & Super Creek (Halloween)', '2021-09-28', '2025-11-22', 12, NULL),
('Kawakami Princess (Original)', '2021-10-10', '2025-11-30', 9, NULL),
('Manhattan Cafe (Original)', '2021-10-19', '2025-12-06', 8, NULL),
('Symboli Rudolf & Gold City (Festival)', '2021-10-27', '2025-12-12', 11, NULL),
('Tosen Jordan (Original)', '2021-11-07', '2025-12-20', 11, NULL),
('Mejiro Dober (Original)', '2021-11-18', '2025-12-27', 10, NULL),
('Oguri Cap & Biwa Hayahide (Christmas)', '2021-11-28', '2026-01-03', 15, NULL),
('Fine Motion (Original)', '2021-12-13', '2026-01-14', 8, NULL),
('Tamamo Cross (Original)', '2021-12-21', '2026-01-19', 9, NULL),
('Haru Urara & TM Opera O (New Years)', '2021-12-30', '2026-01-25', 11, NULL),
('[Rerun] All Banner', '2022-01-10', '2026-02-02', 9, NULL),
('Sakura Chiyano O (Original)', '2022-01-19', '2026-02-08', 8, NULL),
('Mihono Bourbon & Eishin Flash (Valentine)', '2022-01-27', '2026-02-14', 11, NULL),
('Mejiro Ardan (Original)', '2022-02-07', '2026-02-22', 8, NULL),
('Admire Vega (Original)', '2022-02-15', '2026-02-27', 8, NULL),
('Matikanetannhauser & Kitasan Black (Original)', '2022-02-23', '2026-03-05', 11, NULL),
('Satono Diamond (Original)', '2022-03-06', '2026-03-12', 11, NULL),
('Mejiro Bright (Original)', '2022-03-17', '2026-03-20', 11, NULL),
('Seiun Sky & Fuji Kiseki (Ballroom)', '2022-03-28', '2026-03-28', 13, NULL),
('Nishino Flower (Original)', '2022-04-10', '2026-04-06', 8, NULL),
('Yaeno Muteki (Original)', '2022-04-18', '2026-04-11', 9, NULL),
('Nice Nature & King Halo (Cheerleader)', '2022-04-27', '2026-04-18', 12, NULL),
('Ines Fujin (Original)', '2022-05-09', '2026-04-26', 10, NULL),
('Mejiro Palmer (Original)', '2022-05-19', '2026-05-03', 10, NULL),
('Curren Chan & Fine Motion (Original)', '2022-05-29', '2026-05-10', 11, NULL),
('Inari One (Original)', '2022-06-09', '2026-05-17', 10, NULL),
('Sweep Tosho (Original)', '2022-06-19', '2026-05-24', 10, NULL),
('Taiki Shuttle & Mejiro Dober (Camping)', '2022-06-29', '2026-05-31', 11, NULL),
('Air Shakur (Original)', '2022-07-10', '2026-06-08', 9, NULL),
('[Rerun] Narita Brian & Seiun Sky (Original)', '2022-07-19', '2026-06-14', 9, NULL),
('Mejiro McQueen & Gold Ship (Summer)', '2022-07-28', '2026-06-21', 12, NULL),
('Bamboo Memory (Original)', '2022-08-09', '2026-06-29', 9, NULL),
('Copano Rickey (Original)', '2022-08-18', '2026-07-05', 5, NULL),
('Smart Falcon (Grand Live)', '2022-08-23', '2026-07-09', 5, NULL),
('Winning Ticket & Narita Taishin (Steampunk)', '2022-08-28', '2026-07-12', 14, NULL),
('Yukino Bijin (Original)', '2022-09-11', '2026-07-22', 8, NULL),
('Seeking the Pearl (Original)', '2022-09-19', '2026-07-27', 9, NULL),
('Agnes Digital & Meisho Doto (Halloween)', '2022-09-28', '2026-08-03', 12, NULL),
('Aston Machan (Original)', '2022-10-10', '2026-08-11', 6, NULL),
('[Rerun] Seeking the Pearl (Original)', '2022-10-16', '2026-08-15', 2, NULL),	
('Yamanin Zephyr (Original)', '2022-10-18', '2026-08-17', 9, NULL), 
('Tamamo Cross & Inari One (Festival)', '2022-10-27', '2026-08-23', 12, NULL),
('Nakayama Festa (Original)', '2022-11-08', '2026-08-31', 8, NULL),
('Wonder Acute (Original)', '2022-11-16', '2026-09-06', 11, NULL),
('Vodka & Daiwa Scarlet (Christmas)', '2022-11-27', '2026-09-13', 14, NULL),
('Zenno Rob Roy (Original)', '2022-12-11', '2026-09-23', 8, NULL),
('Narita Brian (Blaze)', '2022-12-19', '2026-09-29', 9, NULL),
('Kitasan Black & Satono Diamond (New Year)', '2022-12-28', '2026-10-05', 12, NULL),
('Hokko Tarumae (Original)', '2023-01-09', '2026-10-13', 10, NULL),
('[Rerun] Rice Shower (H) & Haru Urara (NY)', '2023-01-19', '2026-10-20', 0, NULL),
('Daitaku Helios (Original)', '2023-01-19', '2026-10-20', 10, NULL),
('Ines Fujin & Mejiro Ryan (Valentine)', '2023-01-29', '2026-10-27', 14, NULL),
('Shinko Windy (Original)', '2023-02-12', '2026-11-06', 11, NULL),
('Mr. C.B. (Original) & Twin Turbo (Original)', '2023-02-23', '2026-11-14', 14, NULL),
('Daiichi Ruby (Original)', '2023-03-09', '2026-11-23', 10, NULL),
('Symboli Kris S (Original)', '2023-03-19', '2026-11-30', 9, NULL),
('Mejiro Ardan & Sakura Chiyono O (Ballroom)', '2023-03-28', '2026-12-07', 12, NULL),
('Sakura Laurel (Original)', '2023-04-09', '2026-12-15', 9, NULL),
('Neo Universe (Original)', '2023-04-18', '2026-12-21', 9, NULL),
('[Rerun] Gals?', '2023-04-27', '2026-12-27', 12, NULL),
('Matikanetannhauser & Bakushin (Sports Festival)', '2023-05-09', '2027-01-05', 9, NULL),
('Hishi Miracle (Original)', '2023-05-18', '2027-01-11', 10, NULL),
('Tanino Gimlet (Original)', '2023-05-28', '2027-01-18', 11, NULL),
('Nishino Flower & Hishi Amazon (Wedding)', '2023-06-08', '2027-01-26', 10, NULL),
('[Rerun] Taiki Shuttle (Camping) & Zephyr (Origin)', '2023-06-18', '2027-02-02', 10, NULL),
('Marvelous Sunday (Original)', '2023-06-28', '2027-02-09', 11, NULL),
('Bamboo Memory & Tosen Jordan (Summer Trip)', '2023-07-09', '2027-02-16', 11, NULL),
('Katsuragi Ace (Original)', '2023-07-20', '2027-02-24', 10, NULL),
('Sirius Symboli (Original)', '2023-07-30', '2027-03-03', 14, NULL),
('Agnes Tachyon & Silence Sukuka (Summer)', '2023-08-13', '2027-03-13', 10, NULL),
('[Rerun] Copano Rickey & Hokko Tarumae (Origin)', '2023-08-23', '2027-03-20', 7, NULL),
('Narita Top Road (Original)', '2023-08-30', '2027-03-24', 11, NULL),
('Gold Ship (Project L\'Arc)', '2023-09-10', '2027-04-01', 9, NULL),
('Satono Diamond (Project L\'Arc)', '2023-09-19', '2027-04-07', 9, NULL),
('K.S.Miracle (Original)', '2023-09-28', '2027-04-14', 20, NULL),
('Air Shakur & Symboli Kris S (Halloween)', '2023-10-18', '2027-04-28', 11, NULL),
('Mejiro Ramonu (Original)', '2023-10-29', '2027-05-05', 10, NULL),
('Kawakami Princess & Tokai Teio (Festival)', '2023-11-08', '2027-05-12', 11, NULL),
('Tap Dance City (Original)', '2023-11-19', '2027-05-20', 10, NULL),
('Mejiro Palmer & Mejiro Bright (Christmas)', '2023-11-29', '2027-05-27', 20, NULL),
('Cheval Grand (Original)', '2023-12-19', '2027-06-10', 8, NULL),
('Kitasan Black (Anime Collab)', '2023-12-27', '2027-06-15', 12, NULL),
('Satono Crown (Original)', '2023-12-19', '2027-06-10', 8, NULL)
;

INSERT INTO support_banner
(support_name, jp_release_date, global_actual_date, jp_days_until_next, global_days_until_next)
VALUES
('Support Launch Banner', '2021-02-24', '2025-06-25', 5, 0),
('Oguri Cap (Power)', '2021-03-01', '2025-06-25', 7, 7),
('Twin Turbo (Speed)', '2021-03-08', '2025-07-02', 9, 8),
('Mejiro Palmer (Guts)', '2021-03-17', '2025-07-10', 12, 6),
('Kitasan Black (Speed) & Satono Diamond (Stamina)', '2021-03-29', '2025-07-16', 16, 11),
('Yukino Bijin (Wit)', '2021-04-14', '2025-07-27', 11, 7),
('Yaeno Muteki (Power)', '2021-04-25', '2025-03-08', 10, 8),
('[Rerun] Super Creek (Stamina) & Tazuna (Friend)', '2021-05-05', '2025-08-11', 11, 9),
('Sakura Chiyono O (Stamina)', '2021-05-16', '2025-08-20', 11, 8),
('Kawakami Princess (Speed) & Hishi Akebono (Guts)', '2021-05-27', '2025-08-28', 13, NULL),
('[Rerun] Silence Suzuka (Speed) & Tamamo Cross (Stamina)', '2021-06-09', '2025-09-06', 11, NULL),
('Bamboo Memory (Power)', '2021-06-20', '2025-09-13', 8, NULL),
('Seiun Sky (Wit) & King Halo (Power)', '2021-06-28', '2025-09-19', 13, NULL),
('Mejiro Ryan (Guts)', '2021-07-11', '2025-09-28', 8, NULL),
('[Rerun] Vodka (Power) & Nishino Flower (Speed)', '2021-07-19', '2025-10-03', 9, NULL),
('Winning Ticket (Stamina) & Sweep Tosho (Speed)', '2021-07-28', '2025-10-10', 13, NULL),
('[Rerun] Special Week (Guts) & Tokai Teio (Speed)', '2021-08-10', '2025-10-19', 9, NULL),
('Nice Nature (Wit)', '2021-08-19', '2025-10-25', 10, NULL),
('Rice Shower (Power) & Riko Kashimoto (Friend)', '2021-08-29', '2025-11-01', 11, NULL),
('[Rerun] Sakura Bakushin O (Speed) & Biko Pegasus (Speed)', '2021-09-09', '2025-11-09', 10, NULL),
('Ikuno Dictus (Guts)', '2021-09-19', '2025-11-16', 9, NULL),
('Tamano Cross (Power) & Zenno Rob Roy (Speed)', '2021-09-28', '2025-11-22', 12, NULL),
('Seiun Sky (Stamina) & Yaeno Muteki (Power)', '2021-10-10', '2025-11-30',	9, NULL),
('Nakayama Festa (Stamina)', '2021-10-19', '2025-12-06', 8, NULL),
('Curren Chan (Wit) & Narita Brian (Stamina)', '2021-10-27', '2025-12-12', 11, NULL),
('[Re-run] Kitasan Black (Speed) & El Condor Pasa (Power)', '2021-11-07', '2025-12-20', 11, NULL),
('Daitaku Helios (Power)', '2021-11-18', '2025-12-27', 10, NULL),
('Mayano Top Gun (Speed) & Narita Taishin (Wit)', '2021-11-28', '2026-01-03', 15, NULL),
('Manhattan Cafe (Stamina)', '2021-12-13', '2026-01-14', 8, NULL),
('[Rerun] Nice Nature (Wit) & Oguri Cap (Power)', '2021-12-21', '2026-01-19', 9, NULL),
('Matikanefukukitaru (Speed) & Admire Vega (Power)', '2021-12-30', '2026-01-25', 11, NULL),
('Sasami Anshinzawa (Friend)', '2022-01-10', '2026-02-02', 9, NULL),
('[Rerun] Riko Kashimoto (Friend) & Tazuna (Friend)', '2022-01-19', '2026-02-08', 8, NULL),
('Nishino Flower (Wit) & Sakura Bakushin O (Guts)', '2022-01-27', '2026-02-14', 11, NULL),
('Agnes Digital (Power)', '2022-02-07', '2026-02-22', 8, NULL),
('[Rerun] Fine Motion (Wit) & Kawakami Princess (Speed)', '2022-02-15', '2026-02-27', 8, NULL),
('Narita Top Road (Speed) & Admire Vega (Guts)', '2022-02-23', '2026-03-05', 11, NULL),
('Marvelous Sunday (Guts)', '2022-03-06', '2026-03-12', 11, NULL),
('[Rerun] Curren Chan (Wit)', '2022-03-17', '2026-03-20', 11, NULL),
('Symboli Rudolf (Stamina) & Sirius Symboli (Wit)', '2022-03-28', '2026-03-28', 13, NULL),
('Daiwa Scarlet (Power)', '2022-04-10', '2026-04-06', 8, NULL),
('[Rerun] Twin Turbo (Speed) & Ines Fujin (Guts)', '2022-04-18', '2026-04-11', 9, NULL),
('Bamboo Memory (Guts) & Seeking the Pearl (Speed)', '2022-04-27', '2026-04-18', 12, NULL),
('Mr. C.B. (Intelligence)', '2022-05-09', '2026-04-26', 10, NULL),
('[Rerun] Matikanefukukitaru (Speed) & Rice Shower (Power)', '2022-05-19', '2026-05-03', 10, NULL),
('Haru Urara (Power) & Ikuno Dictus (Stamina)', '2022-05-29', '2026-05-10', 11, NULL),
('[Rerun] Sakura Chiyono O (Stamina) & Admire Vega (Power)', '2022-06-09', '2026-05-17', 10, NULL),
('Taiki Shuttle (Speed)', '2022-06-19', '2026-05-24', 10, NULL),
('El Condor Pasa (Guts) & Matikanetannhauser (Wit)', '2022-06-29', '2026-05-31', 11, NULL),
('Air Groove (Power)', '2022-07-10', '2026-06-08', 9, NULL),
('The Throne\'s Assemblage (Group)', '2022-07-19', '2026-06-14', 9, NULL),
('Maruzensky (Speed) & Nakayama Festa (Wit)', '2022-07-28', '2026-06-21', 12, NULL),
('[Rerun] Yukino Bijin (Wit) & Ikuno Dictus (Guts)', '2022-08-09', '2026-06-29', 9, NULL),
('Manhattan Cafe (Stamina)', '2022-08-18', '2026-07-05', 5, NULL),
('Light Hello (Friend) & Agnes Tachyon (Speed)', '2022-08-23', '2026-07-09', 5, NULL),
('Tokai Teio (Wit) & Twin Turbo (Guts)', '2022-08-28', '2026-07-12', 14, NULL),
('[Rerun] Silence Suzuka (Speed) & Smart Falcon (Power)', '2022-09-11', '2026-07-22', 8, NULL),
('Daiichi Ruby (Power)', '2022-09-19', '2026-07-27', 9, NULL),
('Mejiro Palmer (Stamina) & Daitaku Helios (Speed)', '2022-09-28', '2026-08-03', 12, NULL),
('[Rerun] Fine Motion (Wit) & Maruzensky (Speed)', '2022-10-10', '2026-08-11', 6, NULL),
('[Rerun] Daiichi Ruby (Power)', '2022-10-16', '2026-08-15', 2, NULL),
('Symboli Kris S (Stamina)', '2022-10-18', '2026-08-17', 9, NULL),
('Oguri Cap (Wit) & Yaeno Muteki (Guts)', '2022-10-27', '2026-08-23', 12, NULL),
('[Rerun] Super Creek (Stamina) & Mr. C.B. (Wit)', '2022-11-08', '2026-08-31', 8, NULL),
('Eishin Flash (Speed)', '2022-11-16', '2026-09-06', 11, NULL),
('Air Groove (Wit) & Narita Brian (Power)', '2022-11-27', '2026-09-13', 14, NULL),
('[Rerun] Mayano Top Gun (Speed) & Light Hello (Friend)', '2022-12-11', '2026-09-23', 8, NULL),
('Yamanin Zephyr (Guts)', '2022-12-19', '2026-09-29', 9, NULL),
('Special Week (Stamina) & Sweep Tosho (Wit)', '2022-12-28', '2026-10-05', 12, NULL),
('[Rerun] Agnes Tachyon (Speed) & Tokai Teio (Wit)', '2023-01-09', '2026-10-13', 10, NULL),
('[Rerun] Matikanefukukitaru (Speed) & Taiki Shuttle (Speed)', '2023-01-19', '2026-10-20', 0, NULL),
('K.S.Miracle (Guts)', '2023-01-19', '2026-10-20', 10, NULL),
('Marvelous Sunday (Speed) & Biko Pegasus (Power)', '2023-01-29', '2026-10-27', 14, NULL),
('[Rerun] Nishino Flower (Wit) & Maruzensky (Speed)', '2023-02-12', '2026-11-06', 11, NULL),
('Mejiro Ramonu (Wit)', '2023-02-23', '2026-11-14', 14, NULL),
('[Rerun] Sirius Symboli (Wit) & Oguri Cap (Wit)', '2023-03-09', '2026-11-23', 10, NULL),
('Ancestors & Guides (Group)', '2023-03-19', '2026-11-30', 9, NULL),
('Nice Nature (Power) & Mejiro McQueen (Stamina)', '2023-03-28', '2026-12-07', 12, NULL),
('[Rerun] Eishin Flash (Speed) & Air Groove (Wit)', '2023-04-09', '2026-12-15', 9, NULL),
('Symboli Rudolf (Guts)', '2023-04-18', '2026-12-21', 9, NULL),
('Mihono Bourbon (Wit) & Sakura Laurel (Stamina)', '2023-04-27', '2026-12-27', 12, NULL),
('[Rerun] Yamanin Zephyr (Guts) & K.S.Miracle (Guts)', '2023-05-09', '2027-01-05', 9, NULL),
('Jungle Pocket (Speed)', '2023-05-18', '2027-01-11', 10, NULL),
('Daiwa Scarlet (Guts) & Aston Machan (Wit)', '2023-05-28', '2027-01-18', 11, NULL),
('TM Opera O (Wit)', '2023-06-08', '2027-01-26', 10, NULL),
('Mayano Top Gun (Power)', '2023-06-18', '2027-02-02', 10, NULL),
('Gold City (Guts) & Mejiro Palmer (Speed)', '2023-06-28', '2027-02-09', 11, NULL),
('[Rerun] Twin Turbo (Guts) & Daiichi Ruby (Power)', '2023-07-09', '2027-02-16', 11, NULL),
('Wonder Acute (Power)', '2023-07-20', '2027-02-24', 10, NULL),
('Manhattan Cafe (Wit) & Jungle Pocket (Guts)', '2023-07-30', '2027-03-03', 14, NULL),
('[Rerun] Maruzensky (Speed) & Mejiro Ramonu (Wit)', '2023-08-13', '2027-03-13', 10, NULL),
('Mei Satake (Friend) & El Condor Pasa (Speed)', '2023-08-23', '2027-03-20', 7, NULL),
('Nakayama Festa (Wit)', '2023-08-30', '2027-03-24', 11, NULL),
('[Rerun] Special Week (Stamina) & Mejiro McQueen (Stamina)', '2023-09-10', '2027-04-01', 9, NULL),
('Hishi Amazon (Power)', '2023-09-19', '2027-04-07', 9, NULL),
('Tanino Gimlet (Stamina) & Tap Dance City (Guts)', '2023-09-28', '2027-04-14', 20, NULL),
('Gold Ship (Speed)', '2023-10-18', '2027-04-28', 11, NULL),
('Tsurumaru Tsuyoshi (Power) & King Halo (Guts)', '2023-10-29', '2027-05-05', 10, NULL),
('Mejiro McQueen (Wit)', '2023-11-08', '2027-05-12', 11, NULL),
('Sounds of Earth (Stamina)', '2023-11-19', '2027-05-20', 10, NULL),
('Mejiro Dober (Speed) & Mejiro Ramonu (Power)', '2023-11-29', '2027-05-27', 20, NULL),
('Vivlos (Guts)', '2023-12-19', '2027-06-10', 8, NULL),
('Duramente (Speed) & Satono Diamond (Wit)', '2023-12-27', '2027-06-15', 12, NULL)
;

UPDATE character_banner
SET global_est_date = global_actual_date
WHERE id > 10;

UPDATE support_banner
SET global_est_date = global_actual_date
WHERE id > 10;

UPDATE character_banner
SET global_actual_date = NULL
WHERE id > 10;

UPDATE support_banner
SET global_actual_date = NULL
WHERE id > 10;

SET SQL_SAFE_UPDATES = 0;

UPDATE character_banner
SET image_path = CONCAT('uma/', id + 1000, '.png');

UPDATE support_banner
SET image_path = CONCAT('support/', id + 10000, '.png');

ALTER TABLE character_banner
  ADD COLUMN global_actual_end_date DATE NULL,
  ADD COLUMN global_est_end_date DATE NULL;
  
UPDATE character_banner
  SET global_actual_end_date = DATE_ADD(global_actual_date, INTERVAL 11 DAY)
  WHERE global_actual_date IS NOT NULL;

UPDATE character_banner
  SET global_est_end_date = DATE_ADD(global_est_date, INTERVAL 11 DAY)
  WHERE global_est_date IS NOT NULL;

ALTER TABLE support_banner
  ADD COLUMN global_actual_end_date DATE NULL,
  ADD COLUMN global_est_end_date DATE NULL;

UPDATE support_banner
  SET global_actual_end_date = DATE_ADD(global_actual_date, INTERVAL 11 DAY)
  WHERE global_actual_date IS NOT NULL;

UPDATE support_banner
  SET global_est_end_date = DATE_ADD(global_est_date, INTERVAL 11 DAY)
  WHERE global_est_date IS NOT NULL;

SET SQL_SAFE_UPDATES = 1;

SELECT 
    cb.id,
    cb.uma_name,
    sb.support_name,
    cb.jp_release_date,
    cb.global_actual_date,
    cb.global_est_date,
    cb.jp_days_until_next,
    cb.global_days_until_next,
    cb.image_path,
    sb.image_path
FROM character_banner cb
JOIN support_banner sb 
    ON cb.id = sb.id;

