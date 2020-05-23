class Column {
  constructor(name, width, type, isPrimaryKey = false) {
    this.name = name;
    this.width = Number(width);
    this.type = type;
    this.isPrimaryKey = isPrimaryKey == 1 || isPrimaryKey == true;
  }

  getSql() {
    let dataType;
    switch (this.type) {
      case "TEXT":
        dataType = `varchar(${this.width})`;
        break;
      case "BOOLEAN":
        dataType = "boolean";
        break;
      case "INTEGER":
        dataType = "integer";
        break;
      case "DATE":
        dataType = "date";
        break;
      default:
        dataType = "";
    }

    return `${this.name} ${dataType}`;
  }
}

class Table {
  constructor(name) {
    this.name = name;
    this.columns = [];
  }

  addColumn(...args) {
    this.columns.push(new Column(...args));
  }

  getCreateTableQuery() {
    let hasPrimaryKey = false;
    const columnsSql = [];
    const primaryKeys = [];

    this.columns.forEach(col => {
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

    return `CREATE TABLE IF NOT EXISTS ${this.name} (${columnsSql.join(",")});`;
  }

  getInsertQuery() {
    const [columns, param] = [[], []];
    this.columns.forEach((col, i) => {
      columns.push(col.name);
      param.push(`$${i + 1}`);
    });
    return `INSERT INTO ${this.name}(${columns.join(",")}) VALUES(${param.join(",")});`;
  }

  getValuesFromLine(line) {
    const values = [];
    let startIndex = 0;
    this.columns.forEach(col => {
      values.push(line.slice(startIndex, startIndex + col.width).trim());
      startIndex += col.width;
    });
    return values;
  }
}

module.exports = Table;