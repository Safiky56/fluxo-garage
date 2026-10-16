const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Ensure data folder exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_PATH = path.join(DATA_DIR, 'fluxo_garage.db');

// Seed orders used if database is empty
const INITIAL_SEED_ORDERS = [
  {
    id: 'OT-2408',
    owner_name: 'Diego Molina',
    owner_phone: '+591 71234567',
    owner_email: 'diego.molina@gmail.com',
    plate: '4587-KLP',
    vehicle_brand: 'Toyota',
    vehicle_model: 'Corolla Sedan',
    vehicle_year: '2017',
    vehicle_color: 'Plata Metalizado',
    km: '86.240',
    fuel_level: '3/4',
    issue: 'Ruido metálico en tren delantero al girar y cruzar baches.',
    technical_diagnosis: 'Bieleta de barra estabilizadora desgastada con juego mecánico. Bujes de horquilla con fisuras leves.',
    stage: 1, // 0: Recibido, 1: Diagnóstico, 2: Presupuestado, 3: En Reparación, 4: Control de Calidad, 5: Listo para entrega, 6: Entregado
    mechanic_name: 'Carlos Méndez (Jefe de Taller)',
    checklist: { bodywork: true, lights: true, glass: true, tires: true, interior: true, tools: true, docs: true },
    parts: [
      { id: 'p1', description: 'Bieletas de barra estabilizadora (Par)', type: 'part', quantity: 1, unit_price: 180, total: 180 },
      { id: 'p2', description: 'Mano de obra desmontaje e instalación', type: 'service', quantity: 1, unit_price: 120, total: 120 }
    ],
    total_amount: 300,
    currency: 'Bs',
    notes: 'Cliente solicita entrega antes de las 18:00.'
  },
  {
    id: 'OT-2411',
    owner_name: 'Valeria Paz',
    owner_phone: '+591 76543210',
    owner_email: 'valeria.paz@outlook.com',
    plate: '3021-RST',
    vehicle_brand: 'Suzuki',
    vehicle_model: 'Grand Vitara 4x4',
    vehicle_year: '2020',
    vehicle_color: 'Blanco Perlado',
    km: '54.890',
    fuel_level: 'Lleno',
    issue: 'Mantenimiento preventivo periódico de 60.000 km y revisión de frenos.',
    technical_diagnosis: 'Fluidos y filtros cambiados según manual. Discos de freno en tolerancia óptima.',
    stage: 2,
    mechanic_name: 'Marcos Rivas (Técnico Senior)',
    checklist: { bodywork: true, lights: true, glass: true, tires: true, interior: true, tools: true, docs: true },
    parts: [
      { id: 'p1', description: 'Filtro de aceite sintético genuino', type: 'part', quantity: 1, unit_price: 65, total: 65 },
      { id: 'p2', description: 'Aceite sintético 5W-30 Full Synthetic (4L)', type: 'part', quantity: 1, unit_price: 290, total: 290 },
      { id: 'p3', description: 'Filtro de aire motor y cabina', type: 'part', quantity: 1, unit_price: 85, total: 85 },
      { id: 'p4', description: 'Servicio de afinamiento y escaneo computarizado', type: 'service', quantity: 1, unit_price: 150, total: 150 }
    ],
    total_amount: 590,
    currency: 'Bs',
    notes: 'Presupuesto aprobado por WhatsApp.'
  },
  {
    id: 'OT-2413',
    owner_name: 'Jorge Luna',
    owner_phone: '+591 78901234',
    owner_email: 'jorge.luna@corporacion.bo',
    plate: '1190-ABC',
    vehicle_brand: 'Nissan',
    vehicle_model: 'Versa Drive',
    vehicle_year: '2019',
    vehicle_color: 'Gris Grafito',
    km: '71.120',
    fuel_level: '1/4',
    issue: 'Chirrido agudo al frenar suavemente a baja velocidad.',
    technical_diagnosis: 'Pastillas de freno al 15% de espesor útil. Requiere cambio urgente y rectificado de discos.',
    stage: 3,
    mechanic_name: 'Carlos Méndez (Jefe de Taller)',
    checklist: { bodywork: false, lights: true, glass: true, tires: true, interior: true, tools: false, docs: true },
    parts: [
      { id: 'p1', description: 'Pastillas cerámicas delanteras Akebono', type: 'part', quantity: 1, unit_price: 420, total: 420 },
      { id: 'p2', description: 'Líquido de frenos sintético DOT-4', type: 'part', quantity: 1, unit_price: 60, total: 60 },
      { id: 'p3', description: 'Rectificado de discos y mano de obra', type: 'service', quantity: 1, unit_price: 180, total: 180 }
    ],
    total_amount: 660,
    currency: 'Bs',
    notes: 'Vehículo presenta pequeño raspón en parachoques delantero izquierdo preexistente.'
  },
  {
    id: 'OT-2414',
    owner_name: 'Camila Suárez',
    owner_phone: '+591 72345678',
    owner_email: 'camilasuarez@gmail.com',
    plate: '2845-XYD',
    vehicle_brand: 'Hyundai',
    vehicle_model: 'Tucson 2.0 GL',
    vehicle_year: '2021',
    vehicle_color: 'Rojo Carmesí',
    km: '38.450',
    fuel_level: '1/2',
    issue: 'Testigo luminoso Check Engine encendido y pérdida leve de potencia.',
    technical_diagnosis: 'Código OBD-II P0135: Falla en calentador de Sensor de Oxígeno Banco 1. Reemplazado y calibrado.',
    stage: 5, // Listo para entrega
    mechanic_name: 'Marcos Rivas (Técnico Senior)',
    checklist: { bodywork: true, lights: true, glass: true, tires: true, interior: true, tools: true, docs: true },
    parts: [
      { id: 'p1', description: 'Sensor de Oxígeno Primario Bosch Original', type: 'part', quantity: 1, unit_price: 580, total: 580 },
      { id: 'p2', description: 'Diagnóstico por escáner y reseteo de DTC', type: 'service', quantity: 1, unit_price: 150, total: 150 }
    ],
    total_amount: 730,
    currency: 'Bs',
    notes: 'Vehículo probado en ruta. Parámetros de emisión normalizados.'
  }
];

class DatabaseManager {
  constructor() {
    this.sqliteDb = null;
    this.supabase = null;
    this.isSupabaseActive = false;
    this.supabaseError = null;

    this.initSqlite();
    this.initSupabase();
  }

  initSqlite() {
    try {
      this.sqliteDb = new DatabaseSync(DB_PATH);
      this.sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          owner_name TEXT NOT NULL,
          owner_phone TEXT DEFAULT '',
          owner_email TEXT DEFAULT '',
          plate TEXT NOT NULL,
          vehicle_brand TEXT DEFAULT '',
          vehicle_model TEXT DEFAULT '',
          vehicle_year TEXT DEFAULT '',
          vehicle_color TEXT DEFAULT '',
          km TEXT DEFAULT '0',
          fuel_level TEXT DEFAULT '1/2',
          issue TEXT NOT NULL,
          technical_diagnosis TEXT DEFAULT '',
          stage INTEGER DEFAULT 0,
          mechanic_name TEXT DEFAULT 'Carlos Méndez (Jefe de Taller)',
          checklist TEXT DEFAULT '{}',
          parts TEXT DEFAULT '[]',
          total_amount REAL DEFAULT 0,
          currency TEXT DEFAULT 'Bs',
          notes TEXT DEFAULT ''
        );
      `);

      // Seed if empty
      const countStmt = this.sqliteDb.prepare('SELECT COUNT(*) as cnt FROM orders');
      const countRow = countStmt.get();
      if (countRow && countRow.cnt === 0) {
        console.log('[SQLite] Base de datos vacía. Inicializando con órdenes de prueba...');
        this.seedSqlite(INITIAL_SEED_ORDERS);
      }
      console.log('[SQLite] Base de datos local lista y verificada en:', DB_PATH);
    } catch (err) {
      console.error('[SQLite Error]', err);
    }
  }

  seedSqlite(orders) {
    const insertStmt = this.sqliteDb.prepare(`
      INSERT OR REPLACE INTO orders (
        id, owner_name, owner_phone, owner_email, plate,
        vehicle_brand, vehicle_model, vehicle_year, vehicle_color,
        km, fuel_level, issue, technical_diagnosis, stage,
        mechanic_name, checklist, parts, total_amount, currency, notes
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `);

    for (const o of orders) {
      insertStmt.run(
        o.id,
        o.owner_name || '',
        o.owner_phone || '',
        o.owner_email || '',
        (o.plate || '').toUpperCase(),
        o.vehicle_brand || '',
        o.vehicle_model || '',
        o.vehicle_year || '',
        o.vehicle_color || '',
        o.km || '0',
        o.fuel_level || '1/2',
        o.issue || '',
        o.technical_diagnosis || '',
        typeof o.stage === 'number' ? o.stage : 0,
        o.mechanic_name || 'Carlos Méndez (Jefe de Taller)',
        JSON.stringify(o.checklist || {}),
        JSON.stringify(o.parts || []),
        Number(o.total_amount) || 0,
        o.currency || 'Bs',
        o.notes || ''
      );
    }
  }

  initSupabase() {
    let url = process.env.SUPABASE_URL?.trim() || '';
    url = url.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
    const key = process.env.SUPABASE_KEY?.trim();

    if (url && key && url.startsWith('http')) {
      try {
        this.supabase = createClient(url, key);
        this.isSupabaseActive = true;
        this.supabaseError = null;
        console.log('[Supabase] Cliente inicializado apuntando a:', url);
        
        // Test query in background to verify table existence
        this.testSupabaseConnection();
      } catch (err) {
        this.isSupabaseActive = false;
        this.supabaseError = err.message;
        console.warn('[Supabase Init Warning] No se pudo conectar a Supabase:', err.message);
      }
    } else {
      this.isSupabaseActive = false;
      this.supabase = null;
      console.log('[Info] Supabase no configurado en .env. Usando base de datos SQLite local.');
    }
  }

  async testSupabaseConnection() {
    if (!this.supabase) return { ok: false, error: 'Credenciales no configuradas' };
    try {
      const { data, error } = await this.supabase.from('orders').select('id').limit(1);
      if (error) {
        this.isSupabaseActive = false;
        this.supabaseError = error.message;
        console.warn('[Supabase Connection Test] Tabla orders no encontrada o error:', error.message);
        return { ok: false, error: error.message };
      }
      this.isSupabaseActive = true;
      this.supabaseError = null;
      console.log('[Supabase Connection Test] Conexión exitosa a Supabase Cloud!');
      return { ok: true, data };
    } catch (err) {
      this.isSupabaseActive = false;
      this.supabaseError = err.message;
      return { ok: false, error: err.message };
    }
  }

  getStatus() {
    return {
      provider: this.isSupabaseActive ? 'supabase' : 'sqlite',
      supabaseConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_KEY),
      supabaseUrl: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.replace(/https:\/\/(.*)\.supabase\.co.*/, 'https://$1.supabase.co') : null,
      supabaseConnected: this.isSupabaseActive,
      supabaseError: this.supabaseError,
      sqlitePath: DB_PATH,
      message: this.isSupabaseActive
        ? 'Conectado exitosamente a Supabase Cloud (PostgreSQL)'
        : (process.env.SUPABASE_URL ? `Conectado a SQLite Local (Supabase reportó: ${this.supabaseError || 'verificando...'})` : 'Operando con Base de Datos Local SQLite de alto rendimiento')
    };
  }

  normalizeOrder(row) {
    if (!row) return null;
    return {
      id: row.id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      owner_name: row.owner_name,
      owner_phone: row.owner_phone || '',
      owner_email: row.owner_email || '',
      plate: (row.plate || '').toUpperCase(),
      vehicle_brand: row.vehicle_brand || '',
      vehicle_model: row.vehicle_model || '',
      vehicle_year: row.vehicle_year || '',
      vehicle_color: row.vehicle_color || '',
      km: row.km || '0',
      fuel_level: row.fuel_level || '1/2',
      issue: row.issue || '',
      technical_diagnosis: row.technical_diagnosis || '',
      stage: typeof row.stage === 'number' ? row.stage : 0,
      mechanic_name: row.mechanic_name || 'Carlos Méndez (Jefe de Taller)',
      checklist: typeof row.checklist === 'string' ? JSON.parse(row.checklist || '{}') : (row.checklist || {}),
      parts: typeof row.parts === 'string' ? JSON.parse(row.parts || '[]') : (row.parts || []),
      total_amount: Number(row.total_amount) || 0,
      currency: row.currency || 'Bs',
      notes: row.notes || ''
    };
  }

  // --- CRUD OPERATIONS ---

  async getAllOrders({ search, stage } = {}) {
    if (this.isSupabaseActive) {
      try {
        let query = this.supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (typeof stage === 'number' && !isNaN(stage) && stage >= 0) {
          query = query.eq('stage', stage);
        }
        if (search) {
          const s = search.trim();
          query = query.or(`plate.ilike.%${s}%,owner_name.ilike.%${s}%,vehicle_model.ilike.%${s}%,id.ilike.%${s}%`);
        }
        const { data, error } = await query;
        if (!error && data) {
          return data.map(r => this.normalizeOrder(r));
        }
        console.warn('[Supabase getAllOrders fallback to SQLite]:', error?.message);
      } catch (e) {
        console.warn('[Supabase Error]:', e.message);
      }
    }

    // SQLite Fallback
    try {
      let sql = 'SELECT * FROM orders WHERE 1=1';
      const params = [];
      if (typeof stage === 'number' && !isNaN(stage) && stage >= 0) {
        sql += ' AND stage = ?';
        params.push(stage);
      }
      if (search) {
        const s = `%${search.trim().toUpperCase()}%`;
        sql += ' AND (UPPER(plate) LIKE ? OR UPPER(owner_name) LIKE ? OR UPPER(vehicle_model) LIKE ? OR UPPER(id) LIKE ?)';
        params.push(s, s, s, s);
      }
      sql += ' ORDER BY created_at DESC';
      const stmt = this.sqliteDb.prepare(sql);
      const rows = stmt.all(...params);
      return rows.map(r => this.normalizeOrder(r));
    } catch (err) {
      console.error('[SQLite getAllOrders error]:', err);
      return [];
    }
  }

  async getOrderById(id) {
    if (this.isSupabaseActive) {
      try {
        const { data, error } = await this.supabase.from('orders').select('*').eq('id', id).maybeSingle();
        if (!error && data) return this.normalizeOrder(data);
      } catch (e) {
        console.warn('[Supabase getOrderById error]:', e.message);
      }
    }

    try {
      const stmt = this.sqliteDb.prepare('SELECT * FROM orders WHERE id = ?');
      const row = stmt.get(id);
      return this.normalizeOrder(row);
    } catch (err) {
      console.error('[SQLite getOrderById error]:', err);
      return null;
    }
  }

  async getOrderByPlateOrId(term) {
    if (!term) return null;
    const cleanTerm = term.trim().toUpperCase();

    if (this.isSupabaseActive) {
      try {
        const { data, error } = await this.supabase
          .from('orders')
          .select('*')
          .or(`plate.ilike.${cleanTerm},id.ilike.${cleanTerm}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!error && data) return this.normalizeOrder(data);
      } catch (e) {
        console.warn('[Supabase getOrderByPlateOrId error]:', e.message);
      }
    }

    try {
      const stmt = this.sqliteDb.prepare('SELECT * FROM orders WHERE UPPER(plate) = ? OR UPPER(id) = ? ORDER BY created_at DESC LIMIT 1');
      const row = stmt.get(cleanTerm, cleanTerm);
      return this.normalizeOrder(row);
    } catch (err) {
      console.error('[SQLite getOrderByPlateOrId error]:', err);
      return null;
    }
  }

  generateNextId() {
    try {
      const stmt = this.sqliteDb.prepare("SELECT id FROM orders WHERE id LIKE 'OT-%' ORDER BY id DESC LIMIT 1");
      const row = stmt.get();
      if (row && row.id) {
        const num = parseInt(row.id.replace('OT-', ''), 10);
        if (!isNaN(num)) return `OT-${num + 1}`;
      }
    } catch (e) {}
    return `OT-${Math.floor(2420 + Math.random() * 900)}`;
  }

  async createOrder(order) {
    const id = order.id || this.generateNextId();
    const parts = Array.isArray(order.parts) ? order.parts : [];
    const total_amount = parts.reduce((acc, p) => acc + (Number(p.quantity || 1) * Number(p.unit_price || 0)), 0);

    const newOrder = {
      id,
      owner_name: order.owner_name?.trim() || 'Cliente Sin Nombre',
      owner_phone: order.owner_phone?.trim() || '',
      owner_email: order.owner_email?.trim() || '',
      plate: (order.plate || '').trim().toUpperCase(),
      vehicle_brand: order.vehicle_brand?.trim() || '',
      vehicle_model: order.vehicle_model?.trim() || '',
      vehicle_year: order.vehicle_year?.trim() || '',
      vehicle_color: order.vehicle_color?.trim() || '',
      km: order.km?.trim() || '0',
      fuel_level: order.fuel_level || '1/2',
      issue: order.issue?.trim() || 'Revisión general',
      technical_diagnosis: order.technical_diagnosis?.trim() || '',
      stage: typeof order.stage === 'number' ? order.stage : 0,
      mechanic_name: order.mechanic_name || 'Carlos Méndez (Jefe de Taller)',
      checklist: order.checklist || { bodywork: true, lights: true, glass: true, tires: true, interior: true, tools: true, docs: true },
      parts,
      total_amount,
      currency: order.currency || 'Bs',
      notes: order.notes?.trim() || ''
    };

    // Save to SQLite
    try {
      const stmt = this.sqliteDb.prepare(`
        INSERT INTO orders (
          id, owner_name, owner_phone, owner_email, plate,
          vehicle_brand, vehicle_model, vehicle_year, vehicle_color,
          km, fuel_level, issue, technical_diagnosis, stage,
          mechanic_name, checklist, parts, total_amount, currency, notes
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?
        )
      `);
      stmt.run(
        newOrder.id,
        newOrder.owner_name,
        newOrder.owner_phone,
        newOrder.owner_email,
        newOrder.plate,
        newOrder.vehicle_brand,
        newOrder.vehicle_model,
        newOrder.vehicle_year,
        newOrder.vehicle_color,
        newOrder.km,
        newOrder.fuel_level,
        newOrder.issue,
        newOrder.technical_diagnosis,
        newOrder.stage,
        newOrder.mechanic_name,
        JSON.stringify(newOrder.checklist),
        JSON.stringify(newOrder.parts),
        newOrder.total_amount,
        newOrder.currency,
        newOrder.notes
      );
    } catch (err) {
      console.error('[SQLite createOrder error]:', err);
    }

    // Save to Supabase if active
    if (this.isSupabaseActive) {
      try {
        await this.supabase.from('orders').insert([newOrder]);
      } catch (err) {
        console.warn('[Supabase createOrder error]:', err.message);
      }
    }

    return newOrder;
  }

  async updateOrder(id, updates) {
    const existing = await this.getOrderById(id);
    if (!existing) return null;

    let parts = updates.parts !== undefined ? updates.parts : existing.parts;
    if (typeof parts === 'string') {
      try { parts = JSON.parse(parts); } catch(e) { parts = []; }
    }
    const total_amount = updates.total_amount !== undefined
      ? Number(updates.total_amount)
      : parts.reduce((acc, p) => acc + (Number(p.quantity || 1) * Number(p.unit_price || 0)), 0);

    const merged = {
      ...existing,
      ...updates,
      parts,
      total_amount,
      updated_at: new Date().toISOString()
    };

    // Update SQLite
    try {
      const stmt = this.sqliteDb.prepare(`
        UPDATE orders SET
          owner_name = ?,
          owner_phone = ?,
          owner_email = ?,
          plate = ?,
          vehicle_brand = ?,
          vehicle_model = ?,
          vehicle_year = ?,
          vehicle_color = ?,
          km = ?,
          fuel_level = ?,
          issue = ?,
          technical_diagnosis = ?,
          stage = ?,
          mechanic_name = ?,
          checklist = ?,
          parts = ?,
          total_amount = ?,
          currency = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      stmt.run(
        merged.owner_name,
        merged.owner_phone,
        merged.owner_email,
        merged.plate.toUpperCase(),
        merged.vehicle_brand,
        merged.vehicle_model,
        merged.vehicle_year,
        merged.vehicle_color,
        merged.km,
        merged.fuel_level,
        merged.issue,
        merged.technical_diagnosis,
        merged.stage,
        merged.mechanic_name,
        JSON.stringify(merged.checklist || {}),
        JSON.stringify(merged.parts || []),
        merged.total_amount,
        merged.currency,
        merged.notes,
        id
      );
    } catch (err) {
      console.error('[SQLite updateOrder error]:', err);
    }

    // Update Supabase if active
    if (this.isSupabaseActive) {
      try {
        await this.supabase.from('orders').update({
          owner_name: merged.owner_name,
          owner_phone: merged.owner_phone,
          owner_email: merged.owner_email,
          plate: merged.plate.toUpperCase(),
          vehicle_brand: merged.vehicle_brand,
          vehicle_model: merged.vehicle_model,
          vehicle_year: merged.vehicle_year,
          vehicle_color: merged.vehicle_color,
          km: merged.km,
          fuel_level: merged.fuel_level,
          issue: merged.issue,
          technical_diagnosis: merged.technical_diagnosis,
          stage: merged.stage,
          mechanic_name: merged.mechanic_name,
          checklist: merged.checklist,
          parts: merged.parts,
          total_amount: merged.total_amount,
          currency: merged.currency,
          notes: merged.notes,
          updated_at: new Date().toISOString()
        }).eq('id', id);
      } catch (err) {
        console.warn('[Supabase updateOrder error]:', err.message);
      }
    }

    return merged;
  }

  async deleteOrder(id) {
    let deleted = false;
    try {
      const stmt = this.sqliteDb.prepare('DELETE FROM orders WHERE id = ?');
      const res = stmt.run(id);
      deleted = res.changes > 0;
    } catch (e) {
      console.error('[SQLite deleteOrder error]:', e);
    }

    if (this.isSupabaseActive) {
      try {
        await this.supabase.from('orders').delete().eq('id', id);
      } catch (e) {
        console.warn('[Supabase deleteOrder error]:', e.message);
      }
    }

    return deleted;
  }

  async resetDemo() {
    try {
      this.sqliteDb.exec('DELETE FROM orders');
      this.seedSqlite(INITIAL_SEED_ORDERS);
    } catch (e) {
      console.error('[SQLite reset error]:', e);
    }

    if (this.isSupabaseActive) {
      try {
        await this.supabase.from('orders').delete().neq('id', '___none___');
        await this.supabase.from('orders').insert(INITIAL_SEED_ORDERS);
      } catch (e) {
        console.warn('[Supabase reset error]:', e.message);
      }
    }

    return true;
  }
}

const db = new DatabaseManager();
module.exports = db;
