const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db/connection');
const seed = require('../src/db/seeds/seed');
const data = require('../src/db/data/test-data/index');

beforeEach(async() => {
    await seed(data)
});

afterAll(async () => {
  await db.end();
});

describe('GET /api/users', () => {
  test('200: responds with an array of users', async () => {
    const response = await request(app).get('/api/users').expect(200);
    
    expect(response.body.users).toBeInstanceOf(Array);
    expect(response.body.users).toHaveLength(2);
  });

  test('200: users should not contain password field', async () => {
    const response = await request(app).get('/api/users').expect(200);
    
    response.body.users.forEach((user: any) => {
      expect(user).not.toHaveProperty('password');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('isAdmin');
    });
  });
});

describe('GET /api/users/:username', () => {
  test('200: responds with a single user by username', async () => {
    const response = await request(app).get('/api/users/testuser').expect(200);
    
    expect(response.body.user).toEqual({
      username: 'testuser',
      name: 'Test User',
      email: 'testuser@test.com',
      isAdmin: false,
      created_at: expect.any(String)
    });
  });

  test('404: responds with error when user does not exist', async () => {
    const response = await request(app).get('/api/users/nonexistent').expect(404);
    
    expect(response.body.msg).toBe('User not found');
  });
});

describe('POST /api/users', () => {
  test('201: creates a new user and responds with the created user', async () => {
    const newUser = {
      username: 'newuser',
      name: 'New User',
      email: 'newuser@test.com',
      password: 'password123',
      isAdmin: false
    };

    const response = await request(app)
      .post('/api/users')
      .send(newUser)
      .expect(201);

    expect(response.body.user).toEqual({
      username: 'newuser',
      name: 'New User',
      email: 'newuser@test.com',
      isAdmin: false,
      created_at: expect.any(String)
    });

    expect(response.body.user).not.toHaveProperty('password');
  });

  test('201: defaults isAdmin to false if not provided', async () => {
    const newUser = {
      username: 'anotheruser',
      name: 'Another User',
      email: 'another@test.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/users')
      .send(newUser)
      .expect(201);

    expect(response.body.user.isAdmin).toBe(false);
  });

  test('400: responds with error when missing required fields', async () => {
    const incompleteUser = {
      username: 'incomplete',
      email: 'incomplete@test.com'
    };

    const response = await request(app)
      .post('/api/users')
      .send(incompleteUser)
      .expect(400);

    expect(response.body.msg).toBe('Missing required fields');
  });

  test('409: responds with error when username already exists', async () => {
    const duplicateUser = {
      username: 'testuser',
      name: 'Duplicate User',
      email: 'duplicate@test.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/users')
      .send(duplicateUser)
      .expect(409);

    expect(response.body.msg).toBe('User already exists');
  });

  test('409: responds with error when email already exists', async () => {
    const duplicateEmail = {
      username: 'uniqueusername',
      name: 'Unique User',
      email: 'testuser@test.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/users')
      .send(duplicateEmail)
      .expect(409);

    expect(response.body.msg).toBe('User already exists');
  });
});

describe('Error Handling', () => {
  test('404: responds with error for non-existent endpoint', async () => {
    const response = await request(app).get('/api/nonexistent').expect(404);
  });
});