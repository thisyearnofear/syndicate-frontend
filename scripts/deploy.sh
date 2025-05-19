#!/bin/bash

# Script to deploy the frontend to both Vercel and Netlify

echo "🚀 Starting deployment process..."

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check required tools
if ! command_exists git; then
  echo "❌ Git is not installed. Please install Git and try again."
  exit 1
fi

# Ensure we're on main branch with latest changes
echo "📦 Preparing git repository..."
git checkout main
git pull origin main

# Commit any changes if there are some
if [[ -n $(git status --porcelain) ]]; then
  echo "📝 Found uncommitted changes, committing them..."
  git add .
  git commit -m "Auto-commit before deployment: $(date)"
fi

echo "🔍 Checking for Vercel CLI..."
if command_exists vercel; then
  echo "✅ Vercel CLI found!"
  echo "🚀 Deploying to Vercel..."
  vercel --prod -y
else
  echo "⚠️ Vercel CLI not found. Skipping Vercel deployment."
  echo "To install Vercel CLI: npm install -g vercel"
fi

echo "🔍 Checking for Netlify CLI..."
if command_exists netlify; then
  echo "✅ Netlify CLI found!"
  echo "🚀 Deploying to Netlify..."
  netlify deploy --prod
else
  echo "⚠️ Netlify CLI not found. Skipping Netlify deployment."
  echo "To install Netlify CLI: npm install -g netlify-cli"
fi

echo "✅ Deployment process completed!" 