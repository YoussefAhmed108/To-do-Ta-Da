#!/bin/bash

echo "🚀 Setting up TaskFlow Frontend..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node -v) found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.local.example .env.local
    echo "✅ .env.local created"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure the backend server is running (see ../server folder)"
echo "2. Update .env.local with your API URL if needed"
echo "3. Run 'npm run dev' to start the development server"
echo ""
