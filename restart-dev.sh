#!/bin/bash

echo "🛑 Stopping Next.js dev server..."
pkill -f "next dev" 2>/dev/null || true
sleep 2

echo "🔄 Regenerating Prisma client..."
npx prisma generate

echo "🚀 Starting Next.js dev server..."
npm run dev
