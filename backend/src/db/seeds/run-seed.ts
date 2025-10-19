const seed = require("./seed")
const devData = require('../data/development-data/index');
const db = require('../connection')

const runSeed = async () => {
    await seed(devData);
    await db.end();
}

runSeed().catch(err => {
    console.error("Seed failed:", err);
    process.exit(1);
});