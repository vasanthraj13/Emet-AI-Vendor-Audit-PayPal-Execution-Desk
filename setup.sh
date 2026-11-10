#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "  Emet AI — 1-Command Setup & Verification Script         "
echo "  PayPal AI Hackathon: Autonomous Agentic Commerce        "
echo "=========================================================="

echo "[1/4] Checking Node.js environment..."
node -v || { echo "Error: Node.js 20+ required"; exit 1; }

echo "[2/4] Installing dependencies..."
npm install

echo "[3/4] Building production assets (Vite)..."
npm run build

echo "[4/4] Starting Emet AI Full-Stack Server on port 3000..."
echo "----------------------------------------------------------"
echo "  Live App URL: http://localhost:3000"
echo "  Health Check: http://localhost:3000/api/health"
echo "  Press Ctrl+C to stop the server."
echo "----------------------------------------------------------"
npm start
