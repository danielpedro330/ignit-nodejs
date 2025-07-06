import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Transactions routes', () => {

    beforeAll(async () => {
    await app.ready()
    })

    afterAll(async () => {
    app.close()
    })

    beforeEach(async () => {
        execSync('npm run knex migrate:rollback --all', { stdio: 'inherit' })
        execSync('npm run migrate:latest', { stdio: 'inherit' })
    }, 30000)

    // test or it
    test('user can create a new transaction', async () => {
        await request(app.server)
        .post('/transactions')
        .send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit',
        })
        .expect(201)
        
    })

    test('user can lis all transactions',async () => {
        const createTransactionResponse = await request(app.server)
        .post('/transactions')
        .send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit',
        })

        const cookies = createTransactionResponse.get('Set-Cookie')

        if(!cookies){
            throw new Error('invalied Cooke')
        }

        const listTransactionResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200)

            expect(listTransactionResponse.body.transaction).toEqual([
                expect.objectContaining({
                    title: 'New transaction',
                    amount: 5000,
                }),
            ])
    })

    test('user can get a specific transactions',async () => {
        const createTransactionResponse = await request(app.server)
        .post('/transactions')
        .send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit',
        })

        const cookies = createTransactionResponse.get('Set-Cookie')

        if(!cookies){
            throw new Error('invalied Cooke')
        }

        const listTransactionResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200)

        const transactionId = listTransactionResponse.body.transaction[0].id

        const getTransactionResponse = await request(app.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookies)
            .expect(200)

        expect(getTransactionResponse.body.transaction).toEqual(
            expect.objectContaining({
                title: 'New transaction',
                amount: 5000,
            }),
            )
    })

     test('user can get the summary',async () => {
        const createTransactionResponse = await request(app.server)
        .post('/transactions')
        .send({
            title: 'Credit transaction',
            amout: 5000,
            type: 'credit',
        })

        const cookies = createTransactionResponse.get('Set-Cookie')

        if(!cookies){
            throw new Error('cookie invalied')
        }

        await request(app.server)
        .post('/transactions')
        .set('Cookie', cookies)
        .send({
            title: 'Debit transaction',
            amout: 2000,
            type: 'debit',
        })

        const summaryResponse = await request(app.server)
            .get('/transactions/summary')
            .set('Cookie', cookies)
            .expect(200)

            expect(summaryResponse.body.summary).toEqual({
                amout: 3000,
            })
    })
})
