#!/bin/bash

echo "Installing backend dependencies, please wait.."
cd backend
npm install

echo "Starting Node.JS server..."
npm start &

echo "Installing frontend dependencies, please wait.."
cd ../frontend
npm install

# Start frontend server
echo "Starting frontend server.."
npm start
