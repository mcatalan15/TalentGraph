import Fastify from 'fastify'

import { healthCheck, 
    getStudents, 
    getUserData, 
    handleOAuthCallback,
    getStudentsFrom42
 } from './handlers/handlers'

export async function registerRoutes(fastify: ReturnType<typeof Fastify>) {

    fastify.get('/api/health', healthCheck)
    fastify.get('/api/students', getStudents)
    fastify.get('/api/me', getUserData)
    fastify.get('/api/auth/callback', handleOAuthCallback)
    fastify.get('/api/get-students', getStudentsFrom42)

}