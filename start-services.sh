#!/bin/bash

# Project directories
ASTRO_DIR="/home/ec2-user/Proyecto-LSCustoms/Frontend"
NODE_DIR="/home/ec2-user/Proyecto-LSCustoms/Backend"

# Kill any processes using ports 80 and 3000
sudo fuser -k 80/tcp || true
sudo fuser -k 3000/tcp || true

# Start Node.js service first
cd $NODE_DIR
echo "Building backend..."
npm run build
echo "Starting backend..."
screen -dmS nodejs bash -c 'PORT=3000 npm start'

# Wait for backend to be ready
echo "Waiting for backend to start..."
until curl -s http://localhost:3000/api/health > /dev/null; do
    sleep 1
done
echo "Backend is ready!"

# Start Astro service
cd $ASTRO_DIR
echo "Starting frontend..."
screen -dmS astro bash -c 'npm run dev -- --host --port 80' 