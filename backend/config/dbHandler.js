const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
console.log('Connection String loaded:', connectionString ? 'Yes' : 'No');

const pool = new Pool({
    connectionString
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});

const connectDB = async () => {
    try {
        await prisma.$connect()
        console.log("DB connected via Prisma")
    }
    catch (error) {
        console.error(`Database connection error: ${error.message}`);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    await prisma.$disconnect();
}

module.exports = { prisma, connectDB, disconnectDB };