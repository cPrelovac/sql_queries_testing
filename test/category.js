const queries = require("../database/commands");
const expect = require("chai").expect;
const CONFIG = require("../fixtures/actor.json");

let table = "category";

// const queries = require("../database/commands");
// const expect = require("chai").expect;
// test cases:
//  insert into
//  insert with id already in use
//  insert with name bigger than 25
//  delete from table
//  delete from table where name is 'New'
//  select from table where name is 'Games'
//  select from table where last_update > now()
//  select avg (length(name))

describe("Actor table", function () {
  beforeEach(async function () {
    table = await queries.cloneTable(table);
  });
  it("Test Case 1: Insert a valid record", async function () {
    try {
      const result = await queries.insertInto({
        tableName: table,
        columns: ["name"],
        values: ["Test"],
      });
      //   const result = await queries.executeQuery({
      //     tableName: table,
      //     query: ["category_id"],
      //     values: [null],
      //   });
      console.log(result);
      //   expect(result).to.be.an("array");
      //   expect(result.length).to.be.above(0);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  afterEach(async function () {
    await queries.deleteTable(table);
  });
});
