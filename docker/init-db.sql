-- Initialize the database
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist (though it should be created by POSTGRES_DB)
SELECT 'CREATE DATABASE financetracker'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'financetracker');

-- Set up any initial configurations
-- The Prisma schema will be applied by the application container