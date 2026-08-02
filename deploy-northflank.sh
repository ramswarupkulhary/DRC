#!/bin/bash
# Northflank Deployment Script for DRC

set -e

echo "🚀 DRC Northflank Deployment Script"
echo "===================================="

# Step 1: Install Northflank CLI if not present
if ! command -v nf &> /dev/null; then
    echo "📦 Installing Northflank CLI..."
    npm install -g @northflank/cli
fi

# Step 2: Authenticate with Northflank
echo "🔐 Authenticating with Northflank..."
nf auth login

# Step 3: Set project context (replace with your Northflank account/project ID)
echo "📝 Setting project context..."
# You'll need to replace these with your actual values
# nf project set-context YOUR_PROJECT_ID

# Step 4: Create/Deploy from git
echo "🔗 Connecting GitHub repository..."
# This will prompt you to connect your repo
nf service create \
  --name drc-website \
  --type application \
  --buildpack buildpack \
  --source-type git \
  --source-repo ramswarupkulhary/DRC \
  --source-branch main

# Step 5: Set Environment Variables
echo "⚙️  Setting environment variables..."
nf service set-env \
  --service drc-website \
  SMTP_PASSWORD=12CMSxx766@ \
  DATABASE_URL=$DATABASE_URL \
  NEXTAUTH_SECRET=$NEXTAUTH_SECRET \
  NEXT_PUBLIC_BASE_URL=https://your-app.northflank.com \
  NODE_ENV=production

# Step 6: Trigger deployment
echo "🚀 Triggering deployment..."
nf service deploy --service drc-website --branch main

echo "✅ Deployment complete!"
echo "📍 Your app will be available at: https://drc-website.northflank.com"
