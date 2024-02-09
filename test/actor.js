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
  it(`Check if ${last_name} shows ${last_name_values[0]}`, async function () {
    try {
      const result = await queries.executeQuery({
        tableName: "actor",
        query: [last_name],
        values: CONFIG.last_name.values,
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
  it(`Check if ${first_name} shows ${first_name_values[0]}`, async function () {
    try {
      const result = await queries.executeQuery({
        tableName: "actor",
        query: [first_name],
        values: CONFIG.first_name.values,
      });
      expect(result).to.be.an("array");
      expect(result.length).to.be.above(0);
      result.forEach((row) => {
        expect(row.first_name).to.equal("Penelope");
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  it(`Check if ${first_name} AND ${last_name} shows ${first_name_values[0]} AND ${last_name_values[0]}`, async function () {
    try {
      const result = await queries.executeQuery({
        tableName: "actor",
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
  it(`Check if ${first_name} AND ${last_update} shows ${first_name_values[0]} AND >${last_update_values[0]}`, async function () {
    try {
      const result = await queries.executeQuery({
        tableName: "actor",
        query: [first_name, last_update],
        values: [first_name_values[0], `>${last_update_values[0]}`],
        operator: "AND",
      });
      expect(result).to.be.an("array");
      expect(result.length).to.be.eq(0);
      result.forEach((row) => {
        expect(row.first_name).to.not.be.eq(null);
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
