const path = require("path");
const fs = require("fs");
const es = require("event-stream");
const { Pool } = require('pg');
const Table = require("./Table");

const specsPath = path.join(__dirname, "..", "specs");
const dataPath = path.join(__dirname, "..", "data");

// all file names under specs/ and data/
const specsFileNames = fs.readdirSync(specsPath);
const dataFileNames = fs.readdirSync(dataPath);

// a connection pool which allows aquiring clients under it
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'psql',
  port: 5432,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  // process.exit(-1)
  client.release();
});

// First step, creating corresponding table for each spec .csv
function importSpecs() {
  specsFileNames.forEach(fileName => {
    const specName = fileName.slice(0, fileName.indexOf("."));
    const table = new Table(specName);
    let lineNumber = 0;

    const instream = fs
      .createReadStream(path.join(specsPath, fileName))
      .pipe(es.split())
      .pipe(es.mapSync(line => {
        // skip the first line since it is for title names
        if (lineNumber++ > 0) {
          table.addColumn(...line.trim().split(","));
        }
      }))
      .on("error", err => {
        console.log(`Error while reading specs: ${err}`);
      })
      .on("end", async () => {
        console.log(`Done reading specs of ${specName}`);

        const createQuery = table.getCreateTableQuery();
        const client = await pool.connect();
        try {
          await client.query(createQuery);
          console.log(`Done creating table for ${specName}; query: ${createQuery};`);
        } catch (err) {
          console.log(`Error while creating table for ${specName}; query: ${createQuery};`);
        } finally {
          client.release();
        }

        // import corresponding data
        importData(table);
      });
  });
}

function importData(table) {
  const insertQuery = table.getInsertQuery();

  dataFileNames
    .filter(name => name.slice(0, name.indexOf("_")) === table.name)
    .forEach(name => {
      console.log(`Start inserting data from ${name} ...`);

      const instream = fs
        .createReadStream(path.join(dataPath, name))
        .pipe(es.split())
        .pipe(es.map(async line => {
          instream.pause();

          const values = table.getValuesFromLine(line);
          const client = await pool.connect();
          try {
            await client.query(insertQuery, table.getValuesFromLine(line));
          } catch (err) {
            console.log(`Error (${err}) while inserting data from ${name}; query: ${insertQuery}; values: ${values}`);
          } finally {
            client.release();
          }

          instream.resume();
        }))
        .on("error", err => {
          console.log(`Error (${err}) while reading data from ${name}`);
        });
    });
}

importSpecs();