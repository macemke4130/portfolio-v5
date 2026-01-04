use prms;

CREATE TABLE users (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email_address VARCHAR(32) NOT NULL,
    password VARCHAR(32) NOT NULL
);

select * from users;

ALTER TABLE users ADD prms_access BOOL DEFAULT FALSE NOT NULL;

INSERT INTO users (email_address, password, prms_access) VALUES ("", "", 0);

CREATE TABLE shopping_list (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	item_name VARCHAR(128) NOT NULL,
    quantity TINYINT DEFAULT 1 NOT NULL,
    notes VARCHAR(1000),
    priority TINYINT DEFAULT 0 NOT NULL,
    added_by ENUM("Risa", "Mace") NOT NULL,
    got_by ENUM("Risa", "Mace"),
    date_added TIMESTAMP DEFAULT NOW(),
    date_complete TIMESTAMP DEFAULT "1970-1-1"
);

drop table shopping_list;

INSERT INTO shopping_list (item_name, added_by, priority, notes) VALUES ("Coconut Oil", "Mace", 1, "How did we go through this so fast?");
INSERT INTO shopping_list (item_name, added_by, priority, notes) VALUES ("Coffee", "Risa", 0, "Get the good stuff");

select * from shopping_list;

SELECT * FROM shopping_list ORDER BY priority DESC, date_added;
SELECT * FROM shopping_list WHERE got_by IS NULL ORDER BY priority DESC, date_added