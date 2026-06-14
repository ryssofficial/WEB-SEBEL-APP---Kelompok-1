import pool from '../db.js';
import QueryBuilder from '../Databases/QueryBuilder.js';
import { CaseConverter } from '../utils/CaseConverter.js';

export default class BaseModel {
    /**
     * @param {string} tableName 
     * @param {string} primaryKey 
     * @param {Array<string>} fillable
     */
    constructor(tableName, primaryKey = 'id', fillable = []) {
        this.tableName = tableName;
        this.primaryKey = primaryKey;
        this.fillable = fillable;
    }

    /**
     * Membuka query builder dengan opsi menyisipkan client transaksi
     * @param {Object} [trxClient=pool] 
     */
    query(trxClient = pool) {
        return new QueryBuilder(this.tableName, trxClient);
    }

    #sanitizeData(data) {
        if (this.fillable.length === 0) return data;
        const safeData = {};
        for (let key in data) {
            if (this.fillable.includes(key)) {
                safeData[key] = data[key];
            }
        }
        return safeData;
    }

    /**
     * Insert Data Aman
     */
    async create(data, trxClient = pool) {
        const dbData = CaseConverter.transformKeys(data, CaseConverter.toSnakeCase);
        const safeData = this.#sanitizeData(dbData);
        
        const columns = Object.keys(safeData);
        const values = Object.values(safeData);
        
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const colString = columns.join(', ');

        const sql = `INSERT INTO ${this.tableName} (${colString}) VALUES (${placeholders}) RETURNING *`;
        const result = await trxClient.query(sql, values);
        return CaseConverter.transformKeys(result.rows[0], CaseConverter.toCamelCase);
    }

/**
 * Update Data Berdasarkan Primary Key
 */
async update(id, data, trxClient = pool) {
    const dbData = CaseConverter.transformKeys(data, CaseConverter.toSnakeCase);
    const safeData = this.#sanitizeData(dbData);

    const columns = Object.keys(safeData);
    const values = Object.values(safeData);

    if (columns.length === 0) throw new Error('Tidak ada data valid untuk diupdate.');

    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    values.push(id);

    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE ${this.primaryKey} = $${values.length} RETURNING *`;
    const result = await trxClient.query(sql, values);

    if (result.rows.length === 0) throw new Error(`Data dengan id ${id} tidak ditemukan.`);
    return CaseConverter.transformKeys(result.rows[0], CaseConverter.toCamelCase);
}

/**
 * Hapus Data Berdasarkan Primary Key
 */
async delete(id, trxClient = pool) {
    const sql = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1 RETURNING *`;
    const result = await trxClient.query(sql, [id]);

    if (result.rows.length === 0) throw new Error(`Data dengan id ${id} tidak ditemukan.`);
    return CaseConverter.transformKeys(result.rows[0], CaseConverter.toCamelCase);
}

    /**
     * Menjalankan kueri berantai. Jika satu gagal, semua dibatalkan (Rollback).
     * @param {Function} callback 
     */
    static async transaction(callback) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client); // Oper client ke dalam callback
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release(); // Kembalikan koneksi ke pool
        }
    }
}