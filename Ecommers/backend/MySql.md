# MySQL Complete Notes — All Important Commands

---

## 1. Database Commands

| Command | Explanation |
|---|---|
| `SHOW DATABASES;` | Lists all databases present on the MySQL server. |
| `CREATE DATABASE db_name;` | Creates a new database. |
| `USE db_name;` | Selects a database to work with (all further commands apply to it). |
| `DROP DATABASE db_name;` | Deletes a database permanently, along with all its tables. |
| `ALTER DATABASE db_name CHARACTER SET utf8;` | Changes database-level settings like character set. |

---

## 2. Table Commands

| Command | Explanation |
|---|---|
| `SHOW TABLES;` | Lists all tables in the currently selected database. |
| `CREATE TABLE table_name (col1 datatype, col2 datatype, ...);` | Creates a new table with defined columns and data types. |
| `DESCRIBE table_name;` or `DESC table_name;` | Shows the structure (columns, types, keys) of a table. |
| `DROP TABLE table_name;` | Deletes a table and all its data permanently. |
| `TRUNCATE TABLE table_name;` | Removes all rows from a table but keeps the table structure. |
| `RENAME TABLE old_name TO new_name;` | Renames a table. |
| `ALTER TABLE table_name ADD column_name datatype;` | Adds a new column to an existing table. |
| `ALTER TABLE table_name DROP COLUMN column_name;` | Removes a column from a table. |
| `ALTER TABLE table_name MODIFY column_name new_datatype;` | Changes the data type of a column. |
| `ALTER TABLE table_name CHANGE old_col new_col datatype;` | Renames a column and/or changes its type. |

---

## 3. Data Insertion & Modification (DML)

| Command | Explanation |
|---|---|
| `INSERT INTO table_name (col1, col2) VALUES (val1, val2);` | Inserts a new row into a table. |
| `INSERT INTO table_name VALUES (val1, val2, val3);` | Inserts values into all columns in order (no column names needed). |
| `UPDATE table_name SET col1 = value WHERE condition;` | Updates existing records that match a condition. |
| `DELETE FROM table_name WHERE condition;` | Deletes specific rows matching a condition. |
| `DELETE FROM table_name;` | Deletes all rows (structure remains, unlike DROP). |

---

## 4. Data Retrieval (SELECT / Querying)

| Command | Explanation |
|---|---|
| `SELECT * FROM table_name;` | Retrieves all columns and rows from a table. |
| `SELECT col1, col2 FROM table_name;` | Retrieves only specific columns. |
| `SELECT * FROM table_name WHERE condition;` | Filters rows based on a condition. |
| `SELECT * FROM table_name ORDER BY col ASC/DESC;` | Sorts results in ascending or descending order. |
| `SELECT * FROM table_name LIMIT n;` | Limits the number of rows returned. |
| `SELECT DISTINCT col FROM table_name;` | Returns only unique values from a column. |
| `SELECT * FROM table_name GROUP BY col;` | Groups rows sharing a column value (used with aggregate functions). |
| `SELECT * FROM table_name HAVING condition;` | Filters groups after `GROUP BY` (like WHERE, but for groups). |
| `SELECT COUNT(*) FROM table_name;` | Counts total number of rows. |
| `SELECT SUM(col), AVG(col), MIN(col), MAX(col) FROM table_name;` | Aggregate functions for sum, average, minimum, maximum. |

---

## 5. Conditions & Operators

| Command/Operator | Explanation |
|---|---|
| `WHERE col = value` | Filters rows where column equals a value. |
| `WHERE col BETWEEN val1 AND val2` | Filters rows within a range. |
| `WHERE col IN (val1, val2, ...)` | Matches any value in a list. |
| `WHERE col LIKE 'pattern%'` | Pattern matching (% = any characters, _ = single character). |
| `WHERE col IS NULL / IS NOT NULL` | Checks for null or non-null values. |
| `AND / OR / NOT` | Combine or negate multiple conditions. |

---

## 6. Joins (Combining Tables)

| Command | Explanation |
|---|---|
| `SELECT * FROM A INNER JOIN B ON A.id = B.id;` | Returns rows that have matching values in both tables. |
| `SELECT * FROM A LEFT JOIN B ON A.id = B.id;` | Returns all rows from left table, matched rows from right (NULL if no match). |
| `SELECT * FROM A RIGHT JOIN B ON A.id = B.id;` | Returns all rows from right table, matched rows from left. |
| `SELECT * FROM A CROSS JOIN B;` | Returns the Cartesian product (every combination of rows). |
| `SELECT * FROM A FULL OUTER JOIN B` (via UNION) | MySQL has no native FULL JOIN — simulated using `LEFT JOIN UNION RIGHT JOIN`. |

---

## 7. Keys & Constraints

| Command | Explanation |
|---|---|
| `PRIMARY KEY (col)` | Uniquely identifies each row; cannot be NULL. |
| `FOREIGN KEY (col) REFERENCES other_table(col)` | Links a column to a primary key in another table (referential integrity). |
| `UNIQUE (col)` | Ensures all values in a column are different. |
| `NOT NULL` | Ensures a column cannot have a NULL value. |
| `DEFAULT value` | Sets a default value if none is provided. |
| `AUTO_INCREMENT` | Automatically increases numeric value for each new row (used with PK). |
| `CHECK (condition)` | Ensures values satisfy a specific condition. |

---

## 8. Indexes

| Command | Explanation |
|---|---|
| `CREATE INDEX idx_name ON table_name(col);` | Creates an index to speed up searches on a column. |
| `SHOW INDEX FROM table_name;` | Displays all indexes on a table. |
| `DROP INDEX idx_name ON table_name;` | Removes an index. |

---

## 9. User & Privilege Management

| Command | Explanation |
|---|---|
| `CREATE USER 'user'@'localhost' IDENTIFIED BY 'password';` | Creates a new MySQL user. |
| `GRANT ALL PRIVILEGES ON db_name.* TO 'user'@'localhost';` | Gives a user permissions on a database. |
| `REVOKE ALL PRIVILEGES ON db_name.* FROM 'user'@'localhost';` | Removes permissions from a user. |
| `SHOW GRANTS FOR 'user'@'localhost';` | Shows privileges assigned to a user. |
| `DROP USER 'user'@'localhost';` | Deletes a user account. |
| `FLUSH PRIVILEGES;` | Reloads privilege table so changes take effect immediately. |

---

## 10. Transactions (TCL — Transaction Control Language)

| Command | Explanation |
|---|---|
| `START TRANSACTION;` | Begins a new transaction. |
| `COMMIT;` | Saves all changes made during the transaction permanently. |
| `ROLLBACK;` | Undoes changes made since the last COMMIT. |
| `SAVEPOINT sp_name;` | Creates a checkpoint within a transaction to roll back to later. |
| `ROLLBACK TO sp_name;` | Rolls back to a specific savepoint. |

---

## 11. Views

| Command | Explanation |
|---|---|
| `CREATE VIEW view_name AS SELECT ...;` | Creates a virtual table based on a query result. |
| `SELECT * FROM view_name;` | Queries a view like a normal table. |
| `DROP VIEW view_name;` | Deletes a view. |

---

## 12. Common Functions

| Function | Explanation |
|---|---|
| `NOW()` | Returns current date and time. |
| `CURDATE()` | Returns current date. |
| `CONCAT(a, b)` | Joins two or more strings together. |
| `LENGTH(str)` | Returns length of a string. |
| `UPPER(str) / LOWER(str)` | Converts string to upper/lower case. |
| `ROUND(num, decimals)` | Rounds a number to given decimal places. |
| `IFNULL(col, value)` | Returns a default value if column is NULL. |

---

## 13. Backup & Import (Command Line, not SQL)

| Command | Explanation |
|---|---|
| `mysqldump -u user -p db_name > backup.sql` | Exports (backs up) a database to a .sql file. |
| `mysql -u user -p db_name < backup.sql` | Imports a .sql file into a database. |
| `mysql -u user -p` | Logs into the MySQL command-line client. |

---

### Quick Tip
- **DDL** (Data Definition Language): `CREATE`, `ALTER`, `DROP`, `TRUNCATE`
- **DML** (Data Manipulation Language): `INSERT`, `UPDATE`, `DELETE`, `SELECT`
- **DCL** (Data Control Language): `GRANT`, `REVOKE`
- **TCL** (Transaction Control Language): `COMMIT`, `ROLLBACK`, `SAVEPOINT`
