const db = require("../src/db/connection");
const seed = require("../src/db/seeds/seed");
const data = require("../src/db/data/test-data/index");
const bcrypt = require("bcrypt");

const { userData } = data;

describe("User Seed", () => {
  beforeAll(async () => await seed({userData}));
  afterAll(async () => await db.end());
  it("should insert the correct number of users", async () => {
    const { rows } = await db.query(`SELECT * FROM users;`);
    console.log(rows)
    expect(rows.length).toBe(userData.length);
  });

  it("should store hashed passwords", async () => {
    const { rows } = await db.query(`SELECT username, password FROM users;`);

    for (let i = 0; i < rows.length; i++) {
      const plainPassword = userData[i].password;
      const hashedPassword = rows[i].password;
      const match = await bcrypt.compare(plainPassword, hashedPassword);
      expect(match).toBe(true);
    }
  });

  it("should set admin flags correctly", async () => {
    const { rows } = await db.query(`SELECT username, "isAdmin" FROM users;`);

    rows.forEach((row: any) => {
      const original = userData.find((u:any) => u.username === row.username);
      expect(row.isAdmin).toBe(original?.isAdmin);
    });
  });
});
