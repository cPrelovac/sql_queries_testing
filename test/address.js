const queries = require("../database/commands");
const expect = require("chai").expect;
const CONFIG = require("../fixtures/address.json");

let table = "address";
const { columns: columnsTC1, values: valuesTC1 } = CONFIG.TC1;
const { columns: columnsTC2, values: valuesTC2 } = CONFIG.TC2;
const { columns: columnsTC3, values: valuesTC3 } = CONFIG.TC3;
const { columns: columnsTC4, values: valuesTC4 } = CONFIG.TC4;
const { query: queryTC5, values: valuesTC5 } = CONFIG.TC5;
const { columnName: columnNameTC6, operator: operatorTC6 } = CONFIG.TC6;
const {
  columnName: columnNameTC7,
  orderByFunction: orderByFunctionTC7,
  order: orderTC7,
  limit: limitTC7,
} = CONFIG.TC7;
const {
  columnName: columnNameTC8,
  orderByFunction: orderByFunctionTC8,
  order: orderTC8,
  limit: limitTC8,
} = CONFIG.TC8;
const {
  columnName: columnNameTC9,
  operator: operatorTC9,
  operatorColumn: operatorColumnTC9,
} = CONFIG.TC9;
const { query: queryTC10, values: valuesTC10 } = CONFIG.TC10;
const { query: queryTC11, values: valuesTC11 } = CONFIG.TC11;

describe("Actor table", function () {
  before(async function () {
    table = await queries.cloneTable(table);
  });
  it.only("Test Case 1: Insert a valid record", async function () {
    try {
      await queries.insertInto({
        tableName: table,
        columns: columnsTC1,
        values: valuesTC1,
      });
      const res = await queries.executeQuery({
        tableName: table,
        query: [columnsTC1[0]],
        values: [valuesTC1[0]],
      });
      console.log(res);
      columnsTC1.forEach((column, index) => {
        expect(res[0][column]).to.equal(valuesTC1[index]);
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it("Test Case 2: Insert a record with a duplicate address_id", async function () {
    try {
      await queries.insertInto({
        tableName: "address",
        columns: columnsTC2,
        values: valuesTC2,
      });
      throw new Error("Test Case 2 failed: Duplicate address_id was inserted");
    } catch (err) {
      if (
        !err.message.includes("duplicate key value violates unique constraint")
      ) {
        console.error(err);
      }
      expect(err.message).to.include(
        "duplicate key value violates unique constraint"
      );
    }
  });
  it("Test Case 3: Attempt to insert a record with an address longer than 50 characters", async function () {
    try {
      await queries.insertInto({
        tableName: table,
        columns: columnsTC3,
        values: valuesTC3,
      });
      throw new Error(
        "Test Case 3 failed: Address longer than 50 characters was inserted"
      );
    } catch (err) {
      if (
        !err.message.includes("value too long for type character varying(50)")
      ) {
        console.error(err);
      }
      expect(err.message).to.include(
        "value too long for type character varying(50)"
      );
    }
  });
  it("Test Case 4: Attempt to insert a record with an address longer than 50 characters", async function () {
    try {
      await queries.insertInto({
        tableName: "address",
        columns: columnsTC4,
        values: valuesTC4,
      });
      throw new Error("Test Case 4");
    } catch (err) {
      if (!err.message.includes("null value")) {
        console.error(err);
      }
      expect(err.message).to.include("null value");
    }
  });
  it(`Test Case 5: Select all records where the district is ${valuesTC5[0]}`, async function () {
    try {
      const result = await queries.executeQuery({
        tableName: table,
        query: [queryTC5],
        values: valuesTC5,
      });
      expect(result).to.be.an("array");
      expect(result.length).to.be.above(0);
      result.forEach((row) => {
        expect(row.district).to.equal(valuesTC5[0]);
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it(`Test Case 6: Count the number of unique cities (city_id)`, async function () {
    try {
      const result = await queries.getFunctionsFromTable({
        tableName: table,
        columnName: columnNameTC6,
        operator: operatorTC6,
        distinct: true,
      });
      expect(result).to.be.an("array");
      expect(result.length).to.be.above(0);
      expect(result[0].count).to.be.eql("599");
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it(`Test Case 7: Find the record with the longest address`, async function () {
    try {
      const result = await queries.executeOrderedQuery({
        tableName: table,
        orderByColumn: columnNameTC7,
        orderByFunction: orderByFunctionTC7,
        order: orderTC7,
        limit: limitTC7,
      });
      expect(result).to.be.an("array");
      expect(result.length).to.be.above(0);
      expect(result[0].district.length).to.be.at.least(
        result[1].district.length
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it(`Test Case 8: Find the record with the shortest phone number`, async function () {
    try {
      const result = await queries.executeOrderedQuery({
        tableName: table,
        orderByColumn: columnNameTC8,
        orderByFunction: orderByFunctionTC8,
        order: orderTC8,
        limit: limitTC8,
      });
      expect(result).to.be.an("array");
      expect(result.length).to.be.above(0);
      expect(result[1].phone.length).to.be.at.least(result[0].phone.length);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it(`Test Case 9: Find the average length of postal codes`, async function () {
    try {
      const res = await queries.getFunctionsFromTable({
        tableName: table,
        columnName: columnNameTC9,
        operator: operatorTC9,
        operatorColumn: operatorColumnTC9,
      });
      expect(res).to.be.an("array");
      expect(res.length).to.be.above(0);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it(`Test Case 10: Find all records updated from ${valuesTC10[0]}`, async function () {
    try {
      const result = await queries.executeQuery({
        tableName: table,
        query: queryTC10,
        values: [`>${valuesTC10[0]}`],
      });
      result.forEach((row) => {
        const returnedDate = new Date(row.last_update).getTime();
        const expectedDate = new Date(valuesTC10[0]).getTime();
        expect(returnedDate).to.be.greaterThan(expectedDate);
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it(`Test Case 11: Find all records where address2 is not null`, async function () {
    try {
      const result = await queries.executeQuery({
        tableName: table,
        query: queryTC11,
        values: valuesTC11,
      });
      expect(result).to.be.an("array");
      expect(result.length).to.be.eq(0);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  after(async function () {
    await queries.deleteTable(table);
  });
});
