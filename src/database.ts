import { Knex } from "knex"
import setupKnex from 'knex'
import { env } from './env'

export const config: Knex.Config = {
    client: 'sqlite3',
    connection: {
        filename: env.DATABASE_URL,
    },
    useNullAsDefault: true,
    migrations: {
        extension: 'js',
        directory: './db/migrations'
    },
}

 export const knex = setupKnex(config)