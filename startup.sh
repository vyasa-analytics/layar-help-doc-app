#!/bin/bash

echo "Starting Layar Help App local deployment..."

if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Installing npm..."
    sudo apt-get install -y npm
fi

echo "Setting up backend..."
cd backend

if [ ! -f .env ]; then
    echo "No .env file found. Let's create one."
    read -p "Enter your client ID: " client_id
    read -p "Enter your client secret: " client_secret

    cat <<EOF > .env
client_id="$client_id"
client_secret="$client_secret"
EOF
    echo ".env file created successfully."
fi

npm install

echo "Starting backend server..."
npm start &

cd ../frontend

echo "Setting up frontend..."
npm install

echo "Starting frontend server..."
npm start
