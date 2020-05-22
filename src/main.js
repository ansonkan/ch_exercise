const path = require("path");
const fs = require("fs");
const readline = require("readline");
const stream = require("stream");
const { Pool } = require('pg');
const SpecsColumn = require("./SpecsColumn");

const specsPath = path.join(__dirname, "..", "specs");
const dataPath = path.join(__dirname, "..", "data");

const specsFileNames = fs.readdirSync(specsPath);
const dataFileNames = fs.readdirSync(dataPath);

const specsMap = new Map();

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

specsFileNames.forEach(fileName => {
  const instream = fs.createReadStream(path.join(specsPath, fileName));
  const outstream = new stream();
  const rl = readline.createInterface(instream, outstream);
  const specsName = fileName.slice(0, fileName.indexOf("."));
  let count = 0;

  specsMap.set(specsName, []);

  rl.on("line", line => {
    if (count++ > 0) {
      const arr = line.trim().split(",");
      specsMap.get(specsName).push(new SpecsColumn(...arr));
    }
  });

  rl.on("close", async () => {
    let hasPrimaryKey = false;
    const specs = specsMap.get(specsName);
    const columnsSql = [];
    specs.forEach(col => {
      if (col.isPrimaryKey) hasPrimaryKey = true;
      columnsSql.push(col.getSql());
    });
    if (!hasPrimaryKey) {
      columnsSql.unshift("id SERIAL PRIMARY KEY");
    }

    const client = await pool.connect();
    try {
      await client.query(`CREATE TABLE IF NOT EXISTS ${specsName} (${columnsSql.join(",")});`);
      console.log("done creating");
    } finally {
      client.release();
      console.log("done releasing 1");
    }

    dataFileNames
      .filter(name => name.includes(specsName))
      .forEach(name => {
        const instream = fs.createReadStream(path.join(dataPath, name));
        const outstream = new stream();
        const rl = readline.createInterface(instream, outstream);

        rl.on("line", async line => {
          const columns = [];
          const values = [];
          let startIndex = 0;
          specs.forEach(col => {
            columns.push(col.name);
            values.push(line.slice(startIndex, startIndex + col.width).trim());
            startIndex += col.width;
          });
          let insertQuery = `INSERT INTO ${specsName}(${columns.join(",")}) VALUES(${columns.map((x, i) => `$${i + 1}`)});`;
          console.log(`reading data: ${values}`);

          const client = await pool.connect();
          try {
            await client.query(insertQuery, values);
            console.log("done inserting");
          } finally {
            client.release();
            console.log("done releasing 2");
          }

        });
      });
  });
});