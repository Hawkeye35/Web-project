DROP DATABASE if exists `webproject`;
CREATE DATABASE webproject;
USE webproject;

CREATE TABLE Country (
CountryID INT AUTO_INCREMENT PRIMARY KEY,
CountryName VARCHAR(100) NOT NULL
);

CREATE TABLE State (
StateID INT AUTO_INCREMENT PRIMARY KEY,
StateName VARCHAR(100) NOT NULL,
CountryID INT NOT NULL,
INDEX (CountryID),
FOREIGN KEY (CountryID) REFERENCES Country (CountryID)
);

CREATE TABLE Town (
TownID INT AUTO_INCREMENT PRIMARY KEY,
TownName VARCHAR (100) NOT NULL,
StateID INT NOT NULL,
INDEX (StateID),
FOREIGN KEY (StateID) REFERENCES State(StateID)
);

CREATE TABLE DateTable (
DateID INT AUTO_INCREMENT PRIMARY KEY, 
FullDate DATE NOT NULL,
Year INT NOT NULL,
Month INT NOT NULL,
Day INT NOT NULL,
Week INT,
Quarter INT
);

CREATE TABLE Visitors (
VisitorsID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
FirstName VARCHAR (100) NOT NULL,
LastName VARCHAR (100) NOT NULL,
VisitDate DATE NOT NULL,
NumberOfPeople INT NOT NULL,
Price DECIMAL(10,2) NOT NULL,
TownID INT NOT NULL,

INDEX (TownID),
FOREIGN KEY (TownID) REFERENCES Town(TownID)
);

CREATE TABLE OutsideVisitors (
VisitorsID INT AUTO_INCREMENT PRIMARY KEY,
FirstName VARCHAR (100) NOT NULL,
LastName VARCHAR (100) NOT NULL,
VisitDate DATE NOT NULL,
CountryID INT NOT NULL,
INDEX (CountryID),
FOREIGN KEY (CountryID) REFERENCES Country(CountryID)
);

CREATE TABLE VisitorGroups (
  GroupID INT AUTO_INCREMENT PRIMARY KEY,
  VisitDate DATE NOT NULL,
  GroupSize INT NOT NULL,
  TownID INT NULL,
  StateID INT NULL,
  CountryID INT NOT NULL
);

INSERT INTO Country(CountryName) VALUES
('US'), ('CA'), ('ME'),
('CU'), ('UK'), ('JP'), ('ES');

INSERT INTO State (StateName, CountryID) VALUES
('AL', 1), ('AK', 1), ('AZ', 1), ('AR', 1), ('CA', 1),
('CO', 1), ('CT', 1), ('DE', 1), ('FL', 1), ('GA', 1),
('HI', 1), ('ID', 1), ('IL', 1), ('IN', 1), ('IA', 1),
('KS', 1), ('KY', 1), ('LA', 1), ('ME', 1), ('MD', 1),
('MA', 1), ('MI', 1), ('MN', 1), ('MS', 1), ('MO', 1),
('MT', 1), ('NE', 1), ('NV', 1), ('NH', 1), ('NJ', 1),
('NM', 1), ('NY', 1), ('NC', 1), ('ND', 1), ('OH', 1),
('OK', 1), ('OR', 1), ('PA', 1), ('RI', 1), ('SC', 1),
('SD', 1), ('TN', 1), ('TX', 1), ('UT', 1), ('VT', 1),
('VA', 1), ('WA', 1), ('WV', 1), ('WI', 1), ('WY', 1);

INSERT INTO Town (TownName, StateID) 
VALUES ('Oakland', 15), ('Council Bluffs', 15), ('Omaha', 27);

INSERT INTO Visitors (FirstName, LastName, TownID, VisitDate, NumberOfPeople, Price)
VALUES ('William', 'Regen', 2, '2026-03-10', 2, 20.00), ('Ryan', 'Conover', 1, '2026-03-12', 1, 10.00), ('Kelly','Roberston', 3, '2026-03-18', 4, 40.00);

INSERT INTO OutsideVisitors (FirstName, LastName, CountryID, VisitDate)
VALUES ('Izuku', 'Mahoro', 6, '2026-02-27');

INSERT INTO DateTable (FullDate, Year, Month, Day, Week, Quarter)
SELECT
    d,
    YEAR(d),
    MONTH(d),
    DAY(d),
    WEEK(d),
    QUARTER(d)
FROM (
    SELECT DATE('2025-01-01') + INTERVAL n DAY AS d
    FROM (
        SELECT a.a + 10*b.a + 100*c.a AS n
        FROM 
            (SELECT 0 a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
             UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) a,
            (SELECT 0 a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
             UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) b,
            (SELECT 0 a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
             UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) c
    ) AS numbers
) AS dates
WHERE d BETWEEN '2025-01-01' AND '2030-12-31';

INSERT INTO VisitorGroups (VisitDate, GroupSize, CountryID)
VALUES ('2026-03-10', 4, 1);




