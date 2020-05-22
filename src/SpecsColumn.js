class SpecsColumn {
  constructor(name, width, type, isPrimaryKey = false) {
    this.name = name;
    this.width = Number(width);
    this.type = type;
    this.isPrimaryKey = isPrimaryKey;
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

    return `${this.name} ${dataType} ${this.isPrimaryKey ? "PRIMARY KEY" : ""}`;
  }
}

module.exports = SpecsColumn;