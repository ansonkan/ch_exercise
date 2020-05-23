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
    │   └── SpecsColumn.js
    └── ...

1.  **`/src/main_es.js`**: The main program. It uses event-stream module to read file stream.

2.  **`/src/main_readline.js`**: The main program. It uses stream and readline modules to read file stream.

3.  **`/src/create_data.js`**: This is for creating dummy data.

4.  **`/src/SpecsColumn.js`**: A class representing each column of a spec, which stores the name, width, type and a primary flag.

5.  **`/specs/testformat1.csv`**: The given exampe .csv.

6.  **`/specs/book.csv`**: An new .csv with date column.

7.  **`/specs/student.csv`**: An new .csv with specified primary key column.

8.  **`/data`**: A directory for all of the data text files.

The main program was written in two ways because I wanted to test them against large data files. However, turned out both would used up the heap without pausing the stream while processing database queries with .pause() then .resume() afterwards. Therefore, both versions are essentially the same.