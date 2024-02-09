const client = require("../db");

const queries = {
  cloneTable: async (tableName) => {
    try {
      const cloneTableName = `${tableName}_clone`;
      await client.query(
        `CREATE TABLE ${cloneTableName} AS TABLE ${tableName}`
      );
      return cloneTableName;
    } catch (err) {
      console.error(err.stack);
    }
  },

  deleteTable: async (tableName) => {
    try {
      await client.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
    } catch (err) {
      console.error(err.stack);
    }
  },
  executeQuery: async ({ tableName, columns, values, operator, query }) => {
    try {
      let sqlQuery = `SELECT ${
        columns ? columns.join(", ") : "*"
      } FROM ${tableName}`;

      if (query && query.length > 0) {
        const conditions = query.map((condition, index) => {
          if (values[index] === null) {
            return `${condition} IS NULL`;
          } else if (values[index] === "NOT NULL") {
            return `${condition} IS NOT NULL`;
          } else if (values[index].startsWith(">")) {
            return `${condition}>'${values[index].substring(1)}'`;
          } else if (values[index].startsWith("<")) {
            return `${condition}<'${values[index].substring(1)}'`;
          } else {
            return `${condition}='${values[index]}'`;
          }
        });
        sqlQuery += ` WHERE ${conditions.join(` ${operator} `)}`;
      }

      const res = await client.query(sqlQuery);
      return res.rows;
    } catch (err) {
      console.error(err.stack);
      throw err;
    }
  },
  getFunctionsFromTable: async ({ tableName, columnName, operator }) => {
    // List of valid SQL aggregate functions
    const validOperators = ["COUNT", "SUM", "AVG", "MIN", "MAX"];

    // Check if the operator is valid
    if (!validOperators.includes(operator.toUpperCase())) {
      throw new Error(
        `Invalid operator: ${operator}. Must be one of ${validOperators.join(
          ", "
        )}`
      );
    }

    // Check if a column name is required for the operator and if it's provided
    if (operator.toUpperCase() !== "COUNT" && !columnName) {
      throw new Error(`Column name must be provided for operator: ${operator}`);
    }

    // Construct the SQL query
    let sqlQuery;
    if (operator.toUpperCase() === "COUNT" && !columnName) {
      sqlQuery = `SELECT COUNT(*) FROM ${tableName}`;
    } else {
      sqlQuery = `SELECT ${operator}(${columnName}) FROM ${tableName}`;
    }

    // Execute the query
    try {
      const res = await client.query(sqlQuery);
      console.log(res.rows);
      return res.rows;
    } catch (err) {
      console.error(err.stack);
    }
  },
};

module.exports = queries;