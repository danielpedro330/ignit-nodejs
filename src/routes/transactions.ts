import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { abort, title } from 'process'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exits'

export async function transactionsRoutes(app: FastifyInstance) {

    app.get('/', {
        preHandler: [checkSessionIdExists],
    } ,async (request, replay) => {
        const { sessionId } = request.cookies

        const transaction = await knex('transactions')
        .where('session_id', sessionId)
        .select('*')
        return {
            transaction,
        }
    })

    app.get('/:id', {
        preHandler: [checkSessionIdExists],
    } , async (request, replay) => {
        const { sessionId } = request.cookies

        const getTransactionParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getTransactionParamsSchema.parse(request.params)

        const transaction = await knex('transactions')
        .where({
            session_id: sessionId,
            id
        })
        .first()

        return {transaction}
    })

    app.get('/summary', {
        preHandler: [checkSessionIdExists],
    } , async (request, replay) => {
        const { sessionId } = request.cookies

        const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount').first()

        return {summary}
    })

    app.post('/', async (request, replay) => {

        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit'])
        }) 

        const { title, amount, type } = createTransactionBodySchema.parse(request.body)

        let sessionId = request.cookies.sessionId

        if(!sessionId) {
            sessionId = randomUUID()

            replay.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 day
            })
        }

        const transaction = await knex('transactions').insert({
            id: randomUUID(),
            title,
            amount: type == 'credit' ? amount : amount * -1,
            session_id: sessionId,
        })
    
        return replay.status(201).send()
    })
    
}