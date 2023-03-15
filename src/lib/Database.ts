
import * as mysql from 'mysql2'
import credentials from '../etc/database.json'

export default class Database {

    private static get pool() {

        return mysql.createPool(credentials)
    }

    public static query(query: string, placeholders: any[]): Promise<any> {

        return new Promise((resolve, reject) => {

            this.pool.query(query, placeholders, (error, rows) => {

                if (error) { return reject(error) }

                return resolve(rows)
            })
        })
    }

    public static async upsert(table: string, columns: string[], values: any[]) {

        let columnPlaceholders = columns.map((e) => '??').join(', ')
        let valuePlaceholders = values.map((e) => '?').join(', ')
        let query = `REPLACE INTO ?? (${columnPlaceholders}) VALUES (${valuePlaceholders})`

        return this.query(query, [table, ...columns, ...values])
    }
}
