const path = require("path");
const fs = require("fs");
const es = require("event-stream");
const { Pool } = require('pg');
const SpecsColumn = require("./SpecsColumn");

const specsPath = path.join(__dirname, "..", "specs");
const dataPath = path.join(__dirname, "..", "data");

// all file names under specs/ and data/
const specsFileNames = fs.readdirSync(specsPath);
const dataFileNames = fs.readdirSync(dataPath);

// keep a map of (spec name, array of specs) for referencing while reading data
const specsMap = new Map();

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
    const specsName = fileName.slice(0, fileName.indexOf("."));
    specsMap.set(specsName, []);
    let lineNumber = 0;
    const instream = fs
      .createReadStream(path.join(specsPath, fileName))
      .pipe(es.split())
      .pipe(es.mapSync(line => {
        // skip the first line since it is for title names
        if (lineNumber++ > 0) {
          const arr = line.trim().split(",");

          // keep a map of (spec name, array of specs) for referencing while reading data
          specsMap.get(specsName).push(new SpecsColumn(...arr));
        }
      }))
      .on("error", err => {
        console.log(`Error while reading specs: ${err}`);
      })
      .on("end", async () => {
        console.log(`Done reading specs of ${specsName}`);

        let hasPrimaryKey = false;
        const specs = specsMap.get(specsName);
        const columnsSql = [];
        const primaryKeys = [];
        
        specs.forEach(col => {
          if (col.isPrimaryKey) {
            hasPrimaryKey = true;
            primaryKeys.push(col.name);
          }
          columnsSql.push(col.getSql());
        });

        if (hasPrimaryKey) {
          columnsSql.push(`PRIMARY KEY (${primaryKeys.join(",")})`);
        } else {
          // since the example in the exercise has no primary key,
          // then I think adding a serial key by default would be better
          columnsSql.unshift("id SERIAL PRIMARY KEY");
        }

        const createQuery = `CREATE TABLE IF NOT EXISTS ${specsName} (${columnsSql.join(",")});`;
        const client = await pool.connect();
        try {
          await client.query(createQuery);
          console.log(`Done creating table for ${specsName}; query: ${createQuery};`);
        } catch (err) {
          console.log(`Error while creating table for ${specsName}; query: ${createQuery};`);
        } finally {
          client.release();
        }

        // import corresponding data
        importData(specs, specsName);
      });
  });
}

function importData(specs, specsName) {
  dataFileNames
    .filter(name => name.slice(0, name.indexOf("_")) === specsName)
    .forEach(name => {
      console.log(`Start inserting data from ${name} ...`);

      // let lineCount = 0;
      const instream = fs
        .createReadStream(path.join(dataPath, name))
        .pipe(es.split())
        .pipe(es.map(async line => {
          instream.pause();

          const columns = [];
          const values = [];
          let startIndex = 0;
          specs.forEach(col => {
            columns.push(col.name);
            values.push(line.slice(startIndex, startIndex + col.width).trim());
            startIndex += col.width;
          });
          let insertQuery = `INSERT INTO ${specsName}(${columns.join(",")}) VALUES(${columns.map((x, i) => `$${i + 1}`)});`;

          const client = await pool.connect();
          try {
            await client.query(insertQuery, values);
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
      // .on("end", () => {
      //   console.log(`end - inserting data from ${name}; inserted ${lineCount} entries;`);
      // })
      // .on("close", () => {
      //   console.log(`end - inserting data from ${name}; inserted ${lineCount} entries;`);
      // });
    });
}

importSpecs();