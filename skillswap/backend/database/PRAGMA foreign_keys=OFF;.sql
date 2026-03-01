PRAGMA foreign_keys = OFF;

DELETE FROM Notes WHERE userId = USER_ID;

DELETE FROM Progresses WHERE userId = USER_ID;

DELETE FROM VideoProgresses WHERE userId = USER_ID;

DELETE FROM TokenHistories WHERE userId = USER_ID;

DELETE FROM Payments WHERE userId = USER_ID;

DELETE FROM Feedbacks WHERE userId = USER_ID;

DELETE FROM Supports WHERE userId = USER_ID;

DELETE FROM Users WHERE id = USER_ID;

PRAGMA foreign_keys = ON;

UPDATE Users SET tokens = 500 WHERE email = 'user@gmail.com';

SELECT id, name, email, tokens
FROM Users
WHERE
    email = 'user@gmail.com'; 
       