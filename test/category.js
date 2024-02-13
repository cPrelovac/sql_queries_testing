const queries = require("../database/commands");
const expect = require("chai").expect;

let table = "category";

describe("Category table", function () {
  beforeEach(async function () {
    table = await queries.cloneTable("category");
  });
  it("Test Case 1: Insert a valid record", async function () {
    let date = "2024-02-12";

    try {
      await queries.insertInto({
        tableName: table,
        columns: ["category_id", "name", "last_update"],
        values: [17, "Test", date],
      });
      const result = await queries.executeQuery({ tableName: table });
      //   console.log(result[result.length - 1]);
      expect(result).to.be.an("array");
      expect(result.length).to.be.above(0);
      expect(result[result.length - 1].name).to.equal("Test");
      expect(result[result.length - 1].category_id).to.equal(17);
      const returnedDate = new Date(
        result[result.length - 1].last_update
      ).getTime();
      let expectedDate = new Date(date).getTime();
      expectedDate = expectedDate - 3600001;
      expect(returnedDate).to.be.greaterThan(expectedDate);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it("Test Case 2: Insert a record with duplicate id", async function () {
    try {
      await queries.insertInto({
        tableName: "category",
        columns: ["category_id", "name", "last_update"],
        values: [1, "Test", "2024-02-12"],
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
  it("Test Case 3: Attempt to insert a record with an address longer than 25 characters", async function () {
    try {
      await queries.insertInto({
        tableName: table,
        columns: ["name"],
        values: [
          "This is a long string with more than 25 characters and test is expected to fail",
        ],
      });
      throw new Error(
        "Test Case 3 failed: Address longer than 25 characters was inserted"
      );
    } catch (err) {
      if (
        !err.message.includes("value too long for type character varying(25)")
      ) {
        console.error(err);
      }
      expect(err.message).to.include(
        "value too long for type character varying(25)"
      );
    }
  });
  it("Test Case 4: Delete all from ${table} ", async function () {
    try {
      await queries.deleteFrom({
        tableName: table,
      });
      const result = await queries.executeQuery({
        tableName: table,
      });
      expect(result).to.be.an("array");
      expect(result).to.be.empty;
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it("Test Case 5: Delete from Address where name = ${} ", async function () {
    try {
      await queries.deleteFrom({
        tableName: table,
        columns: ["name"],
        values: ["New"],
      });
      const result = await queries.executeQuery({
        tableName: table,
        query: ["name"],
        values: ["New"],
      });
      expect(result).to.be.an("array");
      expect(result).to.be.empty;
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it("Test Case 6: Select from ${table} where name = ${}", async function () {
    try {
      const result = await queries.executeQuery({
        tableName: table,
        query: ["name"],
        values: ["Games"],
      });
      expect(result).to.be.an("array");
      expect(result.length).to.be.above(0);
      result.forEach((row) => {
        expect(row.name).to.be.eq("Games");
        expect(row.category_id).to.be.eq(10);
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it("Test Case 7: Select from ${table} where last_update is 20 years from now", async function () {
    try {
      const result = await queries.executeQuery({
        tableName: table,
        query: ["last_update"],
        values: [`>2004-01-01`],
      });
      expect(result).to.be.an("array");
      expect(result.length).to.be.above(0);
      result.forEach((row) => {
        const returnedDate = new Date(row.last_update).getTime();
        const expectedDate = new Date("2004-01-01").getTime();
        expect(returnedDate).to.be.greaterThan(expectedDate);
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
