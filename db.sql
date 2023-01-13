DROP DATABASE messManagement;
CREATE DATABASE IF NOT EXISTS messManagement;
USE messManagement;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'sqlpassword';

CREATE TABLE Student (
	Roll_No VARCHAR(255) NOT NULL,
	Username VARCHAR(255) NOT NULL,
	Password VARCHAR(255) NOT NULL,
	Contact VARCHAR(255) NOT NULL,
	Name VARCHAR(255) NOT NULL,
	PRIMARY KEY (Roll_No)
);

CREATE TABLE Hostel_Incharge (
	ID VARCHAR(255) NOT NULL,
	Name VARCHAR(255) NOT NULL,
	Hostel VARCHAR(255),
	Username VARCHAR(255) NOT NULL,
	Password VARCHAR(255) NOT NULL,
	Contact_No VARCHAR(255) NOT NULL,
	PRIMARY KEY (ID)
);

CREATE TABLE Hostel (
	Name VARCHAR(255) NOT NULL,
	Hostel_Incharge_Id VARCHAR(255) NOT NULL,
	Contact_No VARCHAR(255) NOT NULL,
	Per_day_cost FLOAT NOT NULL,
	PRIMARY KEY (Name)
);

CREATE TABLE Mess_Incharge (
	ID VARCHAR(255) NOT NULL,
	Name VARCHAR(255) NOT NULL,
	Mess VARCHAR(255) ,
	Username VARCHAR(255) NOT NULL,
	Password VARCHAR(255) NOT NULL,
	Contact_No VARCHAR(255) NOT NULL,
	PRIMARY KEY (ID)
);

CREATE TABLE Mess (
	Name VARCHAR(255) NOT NULL,
	Per_day_cost FLOAT NOT NULL,
	Hostel VARCHAR(255) NOT NULL,
	Contact_No VARCHAR(255) NOT NULL,
	Mess_Incharge_Id VARCHAR(255) NOT NULL,
	Total_Capacity INT ,
	PRIMARY KEY (Name)
);

CREATE TABLE Student_Mess (
	Student_Roll_No VARCHAR(255) NOT NULL,
	Mess VARCHAR(255) ,
	No_of_days INT ,
	PRIMARY KEY (Student_Roll_No)
);

CREATE TABLE Student_Hostel (
	Student_Roll_No VARCHAR(255) NOT NULL,
	Hostel VARCHAR(255) NOT NULL,
	Room_No VARCHAR(255) NOT NULL,
	No_of_days INT default 30,
	PRIMARY KEY (Student_Roll_No)
);

CREATE TABLE Student_Dues (
	Student_Roll_No VARCHAR(255) NOT NULL,
	Dues INT NOT NULL,
	PRIMARY KEY (Student_Roll_No)
);

CREATE TABLE Start_End_Date (
	Id INT NOT NULL ,
	Start DATE default '2022-10-01',
	End DATE default '2022-10-31',

	PRIMARY KEY (Id)
);


ALTER TABLE Student_Mess ADD CONSTRAINT Student_Mess_fk0 FOREIGN KEY (Student_Roll_No) REFERENCES Student(Roll_No);

ALTER TABLE Student_Mess ADD CONSTRAINT Student_Mess_fk1 FOREIGN KEY (Mess) REFERENCES Mess(Name);

ALTER TABLE Student_Hostel ADD CONSTRAINT Student_Hostel_fk0 FOREIGN KEY (Student_Roll_No) REFERENCES Student(Roll_No);

ALTER TABLE Student_Hostel ADD CONSTRAINT Student_Hostel_fk1 FOREIGN KEY (Hostel) REFERENCES Hostel(Name);

ALTER TABLE Mess ADD CONSTRAINT Mess_fk0 FOREIGN KEY (Hostel) REFERENCES Hostel(Name);

ALTER TABLE Mess ADD CONSTRAINT Mess_fk1 FOREIGN KEY (Mess_Incharge_Id) REFERENCES Mess_Incharge(ID);

ALTER TABLE Mess_Incharge ADD CONSTRAINT Mess_incharge_fk0 FOREIGN KEY (Mess) REFERENCES Mess(Name);

ALTER TABLE Hostel ADD CONSTRAINT Hostel_fk0 FOREIGN KEY (Hostel_Incharge_Id) REFERENCES Hostel_Incharge(ID);

ALTER TABLE Hostel_Incharge ADD CONSTRAINT Hostel_Incharge_fk0 FOREIGN KEY (Hostel) REFERENCES Hostel(Name);

ALTER TABLE Student_Dues ADD CONSTRAINT Student_Dues_fk0 FOREIGN KEY (Student_Roll_No) REFERENCES Student(Roll_No);

-- INSERT INTO Student(Roll_No,Username,Password,Contact) VALUES('B190431CS', 'B190431CS','b190431cs',123444);