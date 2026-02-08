#!/bin/bash

# Navigate to the backend directory and start the server
cd backend
npm install
npm start &

# Navigate to the frontend directory and start the development server
cd ../frontend
npm install
npm run dev &

# Wait for both servers to start
wait

echo "Frontend is running on http://localhost:3000"
echo "Backend is running on http://localhost:5000"