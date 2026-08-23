import request from 'supertest';
import { app } from '../app';
import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/hashPassword';

describe('Auth Routes', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should log in with correct credentials and return an access token', async () => {
      const hashedPassword = await hashPassword('password123');
      await prisma.user.create({
        data: {
          email: 'login@example.com',
          name: 'Login User',
          password: hashedPassword,
        },
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'login@example.com', password: 'password123' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.user).toHaveProperty(
        'email',
        'login@example.com'
      );
    });

    it('should reject an incorrect password', async () => {
      const hashedPassword = await hashPassword('password123');
      await prisma.user.create({
        data: {
          email: 'login@example.com',
          name: 'Login User',
          password: hashedPassword,
        },
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'login@example.com', password: 'wrongpassword' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject a non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nouser@example.com', password: 'password123' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
