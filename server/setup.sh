#!/bin/bash

# To-Do Ta-Da! Server Setup Script

echo "🚀 Setting up To-Do Ta-Da! Backend Server..."
echo ""

# Check if MongoDB is running
echo "📦 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null
then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   You can install MongoDB with: brew install mongodb-community"
    echo "   Then start it with: brew services start mongodb-community"
    exit 1
fi
echo "✅ MongoDB is running"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
else
    echo "✅ .env file already exists"
fi
echo ""

# Build the project
echo "🔨 Building TypeScript project..."
npm run build
echo "✅ Build complete"
echo ""

echo "✨ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "   npm run dev"
echo ""
echo "To start the production server, run:"
echo "   npm start"
echo ""
echo "📚 Check README.md for API documentation"
