import request from 'supertest';
import { app } from '../app';
import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/hashPassword';

describe('User Routes', () => {
  beforeEach(async () => {
    // Clean up the database before each test
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Disconnect Prisma after all tests
    await prisma.$disconnect();
  });

  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      // No mock setup needed for integration tests

      const response = await request(app)
        .post('/api/v1/users')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('statusCode', 201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', newUser.email);
    });

    // no duplicate user allowed
    it('should not allow duplicate user', async () => {
      const newUser = {
        email: 'duplicate@example.com',
        name: 'Duplicate User',
        password: 'password123',
      };

      // Create the user for the first time
      await request(app).post('/api/v1/users').send(newUser).expect(201);

      // Try to create the user again with the same email
      const response = await request(app)
        .post('/api/v1/users')
        .send(newUser)
        .expect(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Email already exists');
    });
  });

  describe('GET /api/v1/users', () => {
    it('should get all users', async () => {
      const mockUsers = [
        {
          email: 'user1@example.com',
          name: 'User One',
          password: 'password123',
        },
        {
          email: 'user2@example.com',
          name: 'User Two',
          password: 'password123',
        },
      ];
      // Seed data directly into the database
      await prisma.user.createMany({ data: mockUsers });

      const response = await request(app).get('/api/v1/users').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty(
        'email',
        'user1@example.com'
      );
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get a user by ID', async () => {
      const mockUser = {
        email: 'getbyid@example.com',
        name: 'Get By ID User',
        password: 'password123',
      };
      const createdUser = await prisma.user.create({ data: mockUser });

      const response = await request(app)
        .get(`/api/v1/users/${createdUser.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', createdUser.id);
    });

    it('should return 404 for non-existent user', async () => {
      // No seeding needed, expecting 404

      const response = await request(app).get('/api/v1/users/999').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('PATCH /api/v1/users/:id', () => {
    it("should update a user's name", async () => {
      const updates = { name: 'Updated Name' };
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Old Name',
          password: 'password123',
        },
      });

      const response = await request(app)
        .patch(`/api/v1/users/${user.id}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', 'Updated Name');
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should reject deletion without a super admin token', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'delete@example.com',
          name: 'Delete User',
          password: 'password123',
        },
      });

      const response = await request(app)
        .delete(`/api/v1/users/${user.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should delete a user as a super admin', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'delete@example.com',
          name: 'Delete User',
          password: 'password123',
        },
      });

      const hashedPassword = await hashPassword('adminpass123');
      await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'Admin',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
        },
      });

      const loginResponse = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@example.com',
        password: 'adminpass123',
      });

      const { accessToken } = loginResponse.body.data;

      const response = await request(app)
        .delete(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');
    });
  });
});
