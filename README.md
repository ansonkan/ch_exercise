# ch_exercise

    .
    ├── ...
    ├── data
    │   └── ...
    ├── specs
    │   ├── book.csv
    │   ├── student.csv
    │   └── testformat1.csv
    ├── src
    │   ├── create_data.js
    │   ├── main_es.js
    │   ├── main_readline.js
    │   └── Table.js
    └── ...

1.  **`/src/main_es.js`**: The main program. It uses event-stream module to read file stream.

2.  **`/src/main_readline.js`**: The main program. It uses stream and readline modules to read file stream.

3.  **`/src/create_data.js`**: This is for creating dummy data.

4.  **`/src/Table.js`**: Has two classes inside. Class Table represents a database table, which consists of a name and a array of columns. Class Column represents a database table column, which consists of the information from .csv spec.

5.  **`/specs/testformat1.csv`**: The given exampe .csv.

6.  **`/specs/book.csv`**: An new .csv with a date column and specified compound key.

7.  **`/specs/student.csv`**: An new .csv with a date column and specified primary key column.

8.  **`/data`**: A directory for all of the data text files.

The main program was written in two ways because I wanted to test them against large data files. However, turned out both would used up the heap without pausing the stream while processing database queries with .pause() then .resume() afterwards. Therefore, both versions are essentially the same.