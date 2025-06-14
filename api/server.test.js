// Write your tests here
const db = require('../data/dbConfig');
const Auth = require('./auth/auth-model');
const server = require('./server');
const request = require('supertest');

const mockUser = {
  username: "Doggos",
  password: "12345678"
}

test('sanity', () => {
  expect(true).toBe(true)
})

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

test('Environment Test', () => {
  expect(process.env.NODE_ENV).toBe('testing');
})

describe('Testing Registration', () => {
  test('Registers a new user sucessfully', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send(mockUser)
    
      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('id')
      expect(res.body.username).toBe(mockUser.username)
      expect(res.body).toHaveProperty('password')
      expect(res.body.password).not.toBe(mockUser.password)
  })
  test('Registrations fail if username or password is missing', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send({ username: "" });

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('username and password required')
  })
})
  test('Registration fails if username is taken', async () => {
    await request(server)
      .post('/api/auth/register')
      .send(mockUser);

    const res = await request(server)
      .post('/api/auth/register')
      .send(mockUser)

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('username taken')
  }
)

describe('Testing Login', () => {
  test('Login is successful', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send(mockUser);

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toMatch(/welcome/i)
  })
  test('Login fails if username or password is incorrect or missing', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: 'frog', password: "87654321" })

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('invalid credentials')
  })
})

describe('Testing Jokes', () => {
  test('Jokes load with a valid token', async () => {
    await request(server)
      .post('/api/auth/register')
      .send(mockUser)

    const loginRes = await request(server)
      .post('/api/auth/login')
      .send(mockUser)

    const token = loginRes.body.token
    expect(token).toBeDefined()

    const res = await request(server)
      .get('/api/jokes')
      .set('Authorization', token)

    expect(res.status).toBe(200)
    expect(res.body).toBeInstanceOf(Array)
    expect(res.body.length).toBeGreaterThan(0)
  })

test('Jokes fail to load without a token', async () => {
  const res = await request(server)
    .get('/api/jokes')

  expect(res.status).toBe(401)
  expect(res.body.message).toBe('token required')
})
test('Jokes fail to load with invalid token', async () => {
  const res = await request(server)
    .get('/api/jokes')
    .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoxLCJ1c2VybmFtZSI6IkRvZ2dvcyIsImlhdCI6MTY5NzYwMDAwMCwiZXhwIjoxNjk3Njg2NDAwfQ.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567abc890defg')

  expect(res.status).toBe(401)
  expect(res.body.message).toBe('token invalid')
})
})

afterAll(async() => {
  await db.destroy();
})