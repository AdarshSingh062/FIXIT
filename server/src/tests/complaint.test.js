const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Category = require('../models/Category');
const Complaint = require('../models/Complaint');

let mongoServer;
let citizenToken;
let adminToken;
let categoryId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create Category
  const category = await Category.create({
    name: 'Road Infrastructure',
    defaultPriority: 'High',
    slaHours: 24
  });
  categoryId = category._id;

  // Create Citizen
  const citizenRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Jane Citizen',
      email: 'jane@test.com',
      password: 'Password123',
      role: 'user'
    });
  citizenToken = citizenRes.body.token;

  // Create Admin
  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Admin Boss',
      email: 'boss@test.com',
      password: 'Password123',
      role: 'admin'
    });
  adminToken = adminRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Complaint REST API & Lifecycle', () => {
  let createdComplaintId;

  it('should allow a citizen to report a new problem', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        title: 'Broken road asphalt with potholes',
        description: 'Large potholes across the street making driving difficult',
        category: categoryId.toString(),
        address: '100 Main St',
        latitude: 40.7128,
        longitude: -74.0060
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Broken road asphalt with potholes');
    expect(res.body.data.status).toBe('Pending');
    expect(res.body.data.priority).toBeDefined();
    createdComplaintId = res.body.data._id;
  });

  it('should list complaints with pagination', async () => {
    const res = await request(app).get('/api/complaints?page=1&limit=10');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should allow admin to override priority', async () => {
    const res = await request(app)
      .put(`/api/admin/complaints/${createdComplaintId}/priority`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        priority: 'Critical',
        reason: 'Severe traffic hazard identified'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.priority).toBe('Critical');
    expect(res.body.data.priorityOverridden).toBe(true);
  });
});
