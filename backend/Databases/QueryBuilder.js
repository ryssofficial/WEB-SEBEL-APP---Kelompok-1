// src/Databases/QueryBuilder.js
import pool from '../db.js'; // Asumsikan Anda memiliki koneksi pool dari 'pg'
import { CaseConverter } from '../utils/CaseConverter.js';

export default class QueryBuilder {
    /**
     * @param {string} tableName 
     * @param {Object} [trxClient=pool] - Instance client jika sedang dalam transaksi
     */
    constructor(tableName, trxClient = pool) {
        this.tableName = tableName;
        this.dbClient = trxClient; 
        this.querySelect = '*';
        this.queryJoins = [];
        this.queryWheres = [];
        this.params = [];
        this.paramIndex = 1;
        this.queryLimit = null;
        this.queryOffset = null;
    }

    select(fields) {
        this.querySelect = Array.isArray(fields) ? fields.join(', ') : fields;
        return this;
    }

    join(table, condition, type = 'INNER') {
        this.queryJoins.push(`${type} JOIN ${table} ON ${condition}`);
        return this;
    }

    where(column, operator, value) {
        this.queryWheres.push(`${column} ${operator} $${this.paramIndex}`);
        this.params.push(value);
        this.paramIndex++;
        return this;
    }

    limit(num) {
        this.queryLimit = num;
        return this;
    }

        orderBy(column, direction = 'ASC') {
        this.queryOrderBy = `ORDER BY ${column} ${direction}`;
        return this;
    }

    offset(num) {
        this.queryOffset = num;
        return this;
    }

    async get() {
        let sql = `SELECT ${this.querySelect} FROM ${this.tableName}`;
        
        if (this.queryJoins.length > 0) sql += ` ${this.queryJoins.join(' ')}`;
        if (this.queryWheres.length > 0) sql += ` WHERE ${this.queryWheres.join(' AND ')}`;
        if (this.queryOrderBy) sql += ` ${this.queryOrderBy}`;
        if (this.queryLimit) sql += ` LIMIT ${this.queryLimit}`;
        if (this.queryOffset) sql += ` OFFSET ${this.queryOffset}`;

        try {
            const result = await this.dbClient.query(sql, this.params);
            return CaseConverter.transformKeys(result.rows, CaseConverter.toCamelCase);
        } catch (error) {
            throw new Error(`Database Error: ${error.message}`);
        }
    }

    async first() {
        this.limit(1);
        const results = await this.get();
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Nested Relation Mapper
     * Mengubah data flat hasil JOIN menjadi object bersarang
     * @param {Array} rows - Hasil dari .get()
     * @param {string} prefix - Awalan kolom, contoh: "guru"
     * @param {Array} fields - Daftar kolom milik relasi tersebut
     */
    static nestRelation(rows, prefix, fields) {
        return rows.map(row => {
            const nestedObj = {};
            fields.forEach(field => {
                const flatKey = CaseConverter.toCamelCase(`${prefix}_${field}`);
                const mappedKey = CaseConverter.toCamelCase(field);
                
                if (row[flatKey] !== undefined) {
                    nestedObj[mappedKey] = row[flatKey];
                    delete row[flatKey]; // Hapus dari root object
                }
            });
            row[prefix] = nestedObj;
            return row;
        });
    }
}