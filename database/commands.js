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
  insertInto: async ({ tableName, columns, values }) => {
    try {
      // Check if tableName and values are provided
      if (!tableName || !values) {
        throw new Error("Table name and values are required!");
      }

      // Format values for SQL query
      const formattedValues = values
        .map((value) =>
          value === null || value === undefined
            ? "NULL"
            : typeof value === "string"
            ? `'${value}'`
            : value
        )
        .join(", ");

      // Construct the SQL query
      let sqlQuery = `INSERT INTO ${tableName} (${
        columns ? columns.join(", ") : ""
      }) VALUES (${formattedValues})`;

      const res = await client.query(sqlQuery);
      return res;
    } catch (err) {
      // console.error(err.stack);
      throw err;
    }
  },
  deleteFrom: async ({ tableName, columns, values, operator }) => {
    try {
      let sqlQuery = `DELETE FROM ${tableName}`;
      if (!tableName) {
        throw new Error("Table name is required!");
      }
      if (columns && columns.length > 0) {
        const conditions = columns.map((condition, index) => {
          if (values[index] === null) {
            return `${condition} IS NULL`;
          } else if (typeof values[index] === "string") {
            if (values[index] === "NOT NULL") {
              return `${condition} IS NOT NULL`;
            } else if (values[index].startsWith(">")) {
              return `${condition}>'${values[index].substring(1)}'`;
            } else if (values[index].startsWith("<")) {
              return `${condition}<'${values[index].substring(1)}'`;
            } else {
              return `${condition}='${values[index]}'`;
            }
          } else {
            return `${condition}=${values[index]}`;
          }
        });
        sqlQuery += ` WHERE ${conditions.join(` ${operator} `)}`;
      }
      // Construct the SQL query
      const res = await client.query(sqlQuery);
      return res;
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
          } else if (typeof values[index] === "string") {
            if (values[index] === "NOT NULL") {
              return `${condition} IS NOT NULL`;
            } else if (values[index].startsWith(">")) {
              return `${condition}>'${values[index].substring(1)}'`;
            } else if (values[index].startsWith("<")) {
              return `${condition}<'${values[index].substring(1)}'`;
            } else {
              return `${condition}='${values[index]}'`;
            }
          } else {
            return `${condition}=${values[index]}`;
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
  executeOrderedQuery: async ({
    tableName,
    columns,
    orderByColumn,
    orderByFunction,
    order,
    limit,
  }) => {
    try {
      // Construct the SQL query
      let sqlQuery = `SELECT ${
        columns ? columns.join(", ") : "*"
      } FROM ${tableName}`;

      // Add the ORDER BY clause if orderByColumn is provided
      if (orderByColumn) {
        sqlQuery += ` ORDER BY ${
          orderByFunction ? `${orderByFunction}(` : ""
        }${orderByColumn}${orderByFunction ? ")" : ""} ${order ? order : ""}`;
        if (limit) {
          sqlQuery += ` LIMIT ${limit}`;
        }
      }

      const res = await client.query(sqlQuery);
      return res.rows;
    } catch (err) {
      console.error(err.stack);
      throw err;
    }
  },

  likeOperator: async ({ tableName, columnName, option, character }) => {
    const validOptions = ["END", "START", "CONTAINS"];
    if (!validOptions.includes(option.toUpperCase())) {
      throw new Error(
        `Invalid operator: ${operator}. Must be one of ${validOperators.join(
          ", "
        )}`
      );
    }
    // Check if a column name is required for the operator and if it's provided
    if (option.toUpperCase() !== "COUNT" && !columnName) {
      throw new Error(`Column name must be provided for operator: ${operator}`);
    }
    let sqlQuery;
    if (option.toUpperCase() === "START") {
      sqlQuery = `SELECT * FROM ${tableName} WHERE ${columnName} LIKE '${character.toUpperCase()}%'`;
    } else if (option.toUpperCase() === "END") {
      sqlQuery = `SELECT * FROM ${tableName} WHERE ${columnName} LIKE '%${character.toLowerCase()}'`;
    } else {
      sqlQuery = `SELECT * FROM ${tableName} WHERE ${columnName} LIKE '%${character}%'`;
    }
    try {
      const res = await client.query(sqlQuery);
      // console.log(res.rows);
      return res.rows;
    } catch (err) {
      console.error(err.stack);
      throw err;
    }
  },
  getFunctionsFromTable: async ({
    tableName,
    columnName,
    operator,
    conditions,
    operatorColumn,
    distinct = false, // Add a new parameter for DISTINCT
  }) => {
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
      // Add DISTINCT if it's set to true
      sqlQuery = `SELECT ${operator}(${
        distinct ? "DISTINCT " : ""
      }${columnName}) FROM ${tableName}`;
    }
    if (operator.toUpperCase() === "AVG") {
      if (operatorColumn) {
        sqlQuery = `SELECT AVG (${operatorColumn}(${columnName})) FROM ${tableName}`;
      } else {
        sqlQuery = `SELECT AVG (${columnName}) FROM ${tableName}`;
      }
    }

    // Add the WHERE clause if conditions are provided
    if (conditions && conditions.length > 0) {
      const whereClause = conditions
        .map((condition) => `${condition.column}='${condition.value}'`)
        .join(" AND ");
      sqlQuery += ` WHERE ${whereClause}`;
    }

    // Execute the query
    try {
      const res = await client.query(sqlQuery);
      // console.log(res.rows);
      return res.rows;
    } catch (err) {
      console.error(err.stack);
      throw err;
    }
  },
};

module.exports = queries;
