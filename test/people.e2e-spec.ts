import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /api/people/ success', () => {
    return request(app.getHttpServer())
      .post('/api/people')
      .send({ id: 'Gary', topics: ['magic', 'books'] })
      .expect(201)
      .expect({ id: 'Gary', topics: ['magic', 'books'] });
  });

  it('POST /api/people/ fail on setting invalid id', () => {
    return request(app.getHttpServer())
      .post('/api/people')
      .send({ id: { test: 12 }, topics: [] })
      .expect(400)
      .expect({ message: 'id should have simple type: string, number' });
  });
  it('POST /api/people/ fail on setting invalid topics', () => {
    return request(app.getHttpServer())
      .post('/api/people')
      .send({ id: 'test', topics: [{ id: 12 }, null] })
      .expect(400)
      .expect({ message: 'topics must be an array of strings' });
  });
});
