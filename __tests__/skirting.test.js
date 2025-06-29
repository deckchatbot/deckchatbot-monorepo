const request = require('supertest');

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: { completions: { create: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'mocked' } }] }) } }
  }));
}, { virtual: true });
jest.mock('tesseract.js', () => ({ recognize: jest.fn() }), { virtual: true });
jest.mock('uuid', () => ({ v4: jest.fn(() => 'uuid') }), { virtual: true });
jest.mock('potrace', () => ({ trace: jest.fn() }), { virtual: true });
jest.mock('sqlite3', () => ({
  verbose: () => ({
    Database: jest.fn().mockImplementation(() => ({
      serialize: jest.fn(fn => fn && fn()),
      run: jest.fn(),
      close: jest.fn()
    }))
  })
}), { virtual: true });

jest.mock('sharp', () => {
  const mockImage = {
    greyscale: jest.fn().mockReturnThis(),
    normalise: jest.fn().mockReturnThis(),
    threshold: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    toBuffer: jest.fn(() => Promise.resolve(Buffer.from('img')))
  };
  const sharpMock = jest.fn(() => mockImage);
  sharpMock.__mockImage = mockImage;
  return sharpMock;
}, { virtual: true });

const { app } = require('../server.cjs');

describe('skirting endpoint', () => {
  test('/calculate-skirting basic', async () => {
    const res = await request(app)
      .post('/calculate-skirting')
      .send({
        lengthFt: 10,
        widthFt: 8,
        heightFt: 2,
        sides: 4,
        material: 'Composite'
      });
    expect(res.status).toBe(200);
    expect(res.body.perimeter).toBe("36' 0\"");
    expect(res.body.skirtingArea).toBe('72.00');
    expect(res.body.panelsNeeded).toBe(3);
    expect(res.body.material).toBe('Composite');
    expect(res.body.note).toMatch(/durable/);
  });

  test('/calculate-skirting string inputs', async () => {
    const res = await request(app)
      .post('/calculate-skirting')
      .send({
        length: "12' 6\"",
        width: "10'",
        height: "30\"",
        sides: 3,
        material: 'PVC'
      });
    expect(res.status).toBe(200);
    expect(res.body.material).toBe('PVC');
    expect(res.body.perimeter).toBe("32' 6\"");
    expect(res.body.panelsNeeded).toBe(3);
    expect(res.body.note).toMatch(/rot-proof/);
  });
});

