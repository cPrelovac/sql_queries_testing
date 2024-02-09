CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    start_date VARCHAR(255) NOT NULL,
    end_date VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description text
);
INSERT INTO
 events (
    title,
    start_date,
    end_date,
    description
    ) 
    VALUES (
        'Event 1',
        '2019-01-01',
        '2023-01-01',
        'description'
           );