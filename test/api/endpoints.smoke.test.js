import request from 'supertest';
import { app, testPool } from '../test-setup.js';

// Helpers
function buildAdminFoodUpdate(overrides = {}) {
  const base = {
    nombre: null,
    categoria: null,
    Energia: null,
    Humedad: null,
    Cenizas: null,
    Proteinas: null,
    H_de_C_disp: null,
    Azucares_totales: null,
    Fibra_dietetica_total: null,
    Lipidos_totales: null,
    Ac_grasos_totales: null,
    Ac_grasos_poliinsat: null,
    Ac_grasos_trans: null,
    Colesterol: null,
    Vitamina_A: null,
    Vitamina_C: null,
    Vitamina_D: null,
    Vitamina_E: null,
    Vitamina_K: null,
    Vitamina_B1: null,
    Vitamina_B2: null,
    Niacina: null,
    Vitamina_B6: null,
    Ac_pantotenico: null,
    Vitamina_B12: null,
    Folatos: null,
    Sodio: null,
    Potasio: null,
    Calcio: null,
    Fosforo: null,
    Magnesio: null,
    Hierro: null,
    Zinc: null,
    Cobre: null,
    Selenio: null,
    image_url: null,
  };
  return { ...base, ...overrides };
}

function uniqueEmail(prefix = 'smoke') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}@example.com`;
}

describe('Endpoints smoke (ampliado)', () => {
  it('GET /health → 200 ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok');
  });

  describe('Admin Foods', () => {
    it('create → list → update → get → delete', async () => {
      // Create
      const createRes = await request(app)
        .post('/admin/foods')
        .send({ nombre: 'Alimento Smoke', categoria: 'Test', Energia: 10 });
      expect([201, 200]).toContain(createRes.status);
      expect(createRes.body).toHaveProperty('id');
      const id = createRes.body.id;

      // List
      const listRes = await request(app).get('/admin/foods');
      expect(listRes.status).toBe(200);
      expect(Array.isArray(listRes.body)).toBe(true);

      // Update (send all fields to satisfy SQL placeholders)
      const updatePayload = buildAdminFoodUpdate({
        nombre: 'Alimento Smoke Edit',
        categoria: 'Test',
        Energia: 20,
      });
      const updateRes = await request(app)
        .put(`/admin/foods/${id}`)
        .send(updatePayload);
      expect([200, 201]).toContain(updateRes.status);

      // Public get by id (REST)
      const getResApi = await request(app).get(`/api/alimentos/${id}`);
      expect([200, 404]).toContain(getResApi.status);

      // Legacy get by id
      const getResLegacy = await request(app).get(`/food/${id}`);
      expect([200, 404]).toContain(getResLegacy.status);

      // Delete / inactivate
      const delRes = await request(app).delete(`/admin/foods/${id}`);
      expect([200, 404]).toContain(delRes.status);
    });

    it('upload image → returns filename and url', async () => {
      const res = await request(app)
        .post('/admin/foods/upload-image')
        .attach('image', Buffer.from('fakeimg'), 'test.png');
      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('image_url');
      expect(res.body.image_url).toMatch(/\/uploads\//);
    });
  });

  describe('Public Foods', () => {
    it('GET /api/alimentos?q=... → array', async () => {
      const res = await request(app).get('/api/alimentos?q=Alimento');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Auth basics', () => {
    it('checkEmail → false, then registrar → checkEmail true', async () => {
      const email = uniqueEmail('user');
      // not exists yet
      const chk1 = await request(app).post('/api/auth/checkEmail').send({ email });
      expect(chk1.status).toBe(200);
      expect(chk1.body).toMatchObject({ exists: false });

      // register
      const reg = await request(app).post('/api/auth/registrar').send({
        nombre: 'Smoke Tester',
        email,
        password: 'pass1234',
        altura: 170,
        peso: 70,
        edad: 30,
        nivelActividad: 'moderada',
        sexo: 'M',
        alergias: [],
      });
      expect([200, 201]).toContain(reg.status);

      // exists now
      const chk2 = await request(app).post('/api/auth/checkEmail').send({ email });
      expect(chk2.status).toBe(200);
      expect(chk2.body).toMatchObject({ exists: true });
    });
  });

  describe('Weight logs', () => {
    it('list empty → create → list one → update → delete', async () => {
      const email = uniqueEmail('weight');
      // register a user to get an id in test_usuario
      const reg = await request(app).post('/api/auth/registrar').send({
        nombre: 'Peso Tester',
        email,
        password: 'pass1234',
        altura: 171,
        peso: 68,
        edad: 28,
        nivelActividad: 'moderada',
        sexo: 'F',
        alergias: [],
      });
      expect([200, 201]).toContain(reg.status);

      // fetch id from DB (test table)
      const [rows] = await testPool.query('SELECT id FROM test_usuario WHERE email = ? LIMIT 1', [email]);
      expect(rows && rows[0]).toBeTruthy();
      const userId = rows[0].id;

      // list empty
      const list1 = await request(app).get(`/user/${userId}/weights`);
      expect(list1.status).toBe(200);
      expect(list1.body).toMatchObject({ count: expect.any(Number) });

      // create for today
      const today = new Date().toISOString().split('T')[0];
      const create = await request(app).post(`/user/${userId}/weights`).send({ peso: 72.5, fecha: today });
      expect([200, 201]).toContain(create.status);
      expect(create.body).toHaveProperty('item');
      const weightId = create.body.item?.id;

      // list should include one
      const list2 = await request(app).get(`/user/${userId}/weights`);
      expect(list2.status).toBe(200);
      expect(list2.body.count).toBeGreaterThanOrEqual(1);

      // update weight
      if (weightId) {
        const upd = await request(app)
          .patch(`/user/${userId}/weights/${weightId}`)
          .send({ peso: 73.2 });
        expect(upd.status).toBe(200);
      }

      // delete
      if (weightId) {
        const del = await request(app).delete(`/user/${userId}/weights/${weightId}`);
        expect(del.status).toBe(200);
      }
    });
  });
});
