const queries = require("../database/commands");
const expect = require("chai").expect;
const CONFIG = require("../fixtures/address.json");

let table = "address";
const { columns: columnsTC1, values: valuesTC1 } = CONFIG.TC1;
const { columns: columnsTC2, values: valuesTC2 } = CONFIG.TC2;
const { columns: columnsTC3, values: valuesTC3 } = CONFIG.TC3;
const { columns: columnsTC4, values: valuesTC4 } = CONFIG.TC4;

describe("Actor table", function () {
  before(async function () {
    table = await queries.cloneTable(table);
  });
  it("Test Case 1: Insert a valid record", async function () {
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
  after(async function () {
    await queries.deleteTable(table);
  });
});
