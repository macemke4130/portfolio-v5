ALTER TABLE users ADD prms_access BOOL DEFAULT FALSE NOT NULL;
INSERT INTO users (email_address, password, prms_access) VALUES ("risahustad@gmail.com", "numtot", 0);

CREATE TABLE shopping_list (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	item_name VARCHAR(128) NOT NULL,
    quantity TINYINT DEFAULT 1 NOT NULL,
    notes VARCHAR(1000),
    priority TINYINT DEFAULT 0 NOT NULL,
    added_by ENUM("Risa", "Mace") NOT NULL,
    got_by ENUM("Risa", "Mace"),
    date_added TIMESTAMP DEFAULT NOW(),
    date_complete TIMESTAMP DEFAULT 0
);

Select * from shopping_list;

create table chores (
	id int not null auto_increment primary key,
    chore_name varchar(64) not null,
    notes VARCHAR(1000),
    repeats_every_hours smallint,
    repeats_day_of_week smallint,
    points smallint default 10 not null,
    added_by ENUM("Risa", "Mace") NOT NULL,
    done_by ENUM("Risa", "Mace"),
    date_added timestamp default now(),
    date_due timestamp default 0,
    date_complete timestamp default 0
);

select * from chores;

drop table chores;