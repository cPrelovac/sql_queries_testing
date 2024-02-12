const queries = require("../database/commands");
const expect = require("chai").expect;
const CONFIG = require("../fixtures/actor.json");

let table = "actor";
const { query: first_name, values: first_name_values } = CONFIG.first_name;
const { query: last_name, values: last_name_values } = CONFIG.last_name;
const { query: last_update, values: last_update_values } = CONFIG.last_update;

describe("Actor table", function () {
  beforeEach(async function () {
    table = await queries.cloneTable("actor");
  });
  it("Test Case 1: Select all actors", async function () {
    try {
      const result = await queries.executeQuery({ tableName: table });
      expect(result).to.be.an("array");
      expect(result.length).to.be.above(0);
      result.forEach((row) => {
        expect(
          (typeof row.first_name === "string" ||
            typeof row.first_name === null ||
            typeof row.first_name === undefined) &&
            (typeof row.last_name === "string" ||
              typeof row.last_name === null ||
              typeof row.last_name === undefined) &&
            typeof row.actor_id === "number"
        ).to.be.true;
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it("Test Case 2: Select an actor by ID", async function () {
    try {
      const result = await queries.executeQuery({
        tableName: table,
        query: ["actor_id"],
        values: [1],
      });
      expect(result).to.be.an("array");
      expect(result.length).to.be.above(0);
      result.forEach((row) => {
        expect(row.actor_id).to.equal(1);
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it(`Test Case 3: Select actors with a specific first name`, async function () {
    try {
      const result = await queries.executeQuery({
        tableName: table,
        query: [first_name],
        values: first_name_values,
      });
      expect(result).to.be.an("array");
      expect(result.length).to.be.above(0);
      result.forEach((row) => {
        expect(row.first_name).to.equal(first_name_values[0]);
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it(`Test Case 4: Select actors with a specific last name`, async function () {
    try {
      const result = await queries.executeQuery({
        tableName: table,
        query: [last_name],
        values: last_name_values,
      });
      expect(result).to.be.an("array");
      expect(result.length).to.be.above(0);
      // Check if all results have first_name="Penelope"
      result.forEach((row) => {
        expect(row.last_name).to.equal(last_name_values[0]);
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it(`Test Case 5: Select actors updated after a specific date`, async function () {
    try {
      const result = await queries.executeQuery({
        tableName: table,
        query: [last_update],
        values: [`>${last_update_values[0]}`],
      });
      expect(result).to.be.an("array");
      expect(result.length).to.be.above(0);
      result.forEach((row) => {
        const returnedDate = new Date(row.last_update).getTime();
        const expectedDate = new Date(last_update_values[0]).getTime();
        expect(returnedDate).to.be.greaterThan(expectedDate);
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it(`Test Case 6: Select actors with a specific first name and last name`, async function () {
    try {
      const result = await queries.executeQuery({
        tableName: table,
        query: [first_name, last_name],
        values: [first_name_values[0], last_name_values[0]],
        operator: "AND",
      });

      expect(result).to.be.an("array");
      expect(result.length).to.be.above(0);
      // Uncomment the following lines if you want to check specific columns in the result
      result.forEach((row) => {
        expect(row.first_name).to.equal(first_name_values[0]);
        expect(row.last_name).to.equal(last_name_values[0]);
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it(`Test Case 7: Count the number of actors with a specific first name`, async function () {
    try {
      const result = await queries.getFunctionsFromTable({
        tableName: table,
        operator: "count",
        conditions: [{ column: "first_name", value: first_name_values[0] }],
      });

      expect(result).to.be.an("array");
      expect(result.length).to.be.eq(1);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it(`Test Case 8: Select actors with a first name that starts with a specific letter`, async function () {
    try {
      const result = await queries.likeOperator({
        tableName: table,
        columnName: "first_name",
        option: "START",
        character: "j",
      });
      expect(result).to.be.an("array");
      expect(result.length).to.be.above(0);
      result.forEach((row) => {
        expect(row.first_name)
          .to.be.a("string")
          .and.satisfy((string) => string.startsWith("J"));
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it(`Test Case 9: Select actors with a first name that ends with a specific letter`, async function () {
    try {
      const result = await queries.likeOperator({
        tableName: table,
        columnName: "first_name",
        option: "END",
        character: "e",
      });
      console.log(result);
      expect(result).to.be.an("array");
      expect(result.length).to.be.above(0);
      result.forEach((row) => {
        expect(row.first_name)
          .to.be.a("string")
          .and.satisfy((string) => string.endsWith("e"));
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it(`Test Case 10: Select actors with a first name that ends with a specific letter`, async function () {
    try {
      const result = await queries.likeOperator({
        tableName: table,
        columnName: "first_name",
        option: "CONTAINS",
        character: "e",
      });
      expect(result).to.be.an("array");
      expect(result.length).to.be.above(0);
      result.forEach((row) => {
        expect(row.first_name).to.be.a("string").and.to.contain("e");
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  afterEach(async function () {
    await queries.deleteTable(table);
  });
});
