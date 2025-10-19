const db = require('./connection');

const query = async () => {
  try {
    console.log('\n--- USERS ---');
    const users = await db.query('SELECT username, name, email, "isAdmin" FROM users;');
    console.table(users.rows);

    console.log('\n--- EVENTS ---');
    const events = await db.query('SELECT event_id, title, location, date, capacity, price FROM events ORDER BY date LIMIT 10;');
    console.table(events.rows);

    console.log('\n--- TOTALS ---');
    const userCount = await db.query('SELECT COUNT(*) FROM users;');
    const eventCount = await db.query('SELECT COUNT(*) FROM events;');
    console.log(`Total Users: ${userCount.rows[0].count}`);
    console.log(`Total Events: ${eventCount.rows[0].count}`);

    await db.end();
  } catch (error) {
    console.error('Query error:', error);
    await db.end();
    process.exit(1);
  }
};

query();