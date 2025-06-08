#!/bin/bash

# Project directories
ASTRO_DIR="/home/ec2-user/Proyecto LSCustoms/Frontend"
NODE_DIR="/home/ec2-user/Proyecto LSCustoms/Backend"

# Kill any processes using ports 80 and 3000
sudo fuser -k 80/tcp || true
sudo fuser -k 3000/tcp || true

# Start Astro service
cd $ASTRO_DIR
screen -dmS astro bash -c 'npm run dev -- --host --port 80'

# Start Node.js service
cd $NODE_DIR
screen -dmS nodejs bash -c 'npm start' 