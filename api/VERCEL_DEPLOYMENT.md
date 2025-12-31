# Deploying Firestore to Grafana API on Vercel

This guide explains how to deploy your Flask API to Vercel for serverless hosting.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. The Vercel CLI installed (optional): `npm i -g vercel`
3. Your `firebase_credentials.json` file

## Deployment Steps

### Step 1: Prepare Firebase Credentials

For security reasons, you should not commit your Firebase credentials file to your repository. Instead, you'll need to:

1. Base64 encode your `firebase_credentials.json` file:
   ```bash
   export FIREBASE_CREDENTIALS=$(base64 -w 0 firebase_credentials.json)
   ```

2. Copy the output - you'll need this for the environment variable setup.

### Step 2: Deploy to Vercel

#### Option A: Using the Vercel Dashboard

1. Push your code (including the new `vercel.json` and `vercel_app.py` files) to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your repository
4. During the import process, add the environment variable:
   - Key: `FIREBASE_CREDENTIALS`
   - Value: The base64-encoded string from Step 1
5. Click "Deploy"

#### Option B: Using the Vercel CLI

1. Navigate to your `api` directory: `cd api`
2. Run `vercel` command
3. When prompted, add the environment variable:
   - Key: `FIREBASE_CREDENTIALS`
   - Value: The base64-encoded string from Step 1
4. Follow the prompts to complete the deployment

### Step 3: Set Environment Variables

After deployment, you can also add environment variables through the Vercel dashboard:

1. Go to your project dashboard
2. Click on "Settings" → "Environment Variables"
3. Add the following variable:
   - Name: `FIREBASE_CREDENTIALS`
   - Value: Your base64-encoded Firebase credentials

## API Endpoints

Once deployed, your API will be available at:
- `https://your-project-name.vercel.app/api/health` - Health check
- `https://your-project-name.vercel.app/api/data` - Get all Firestore data
- `https://your-project-name.vercel.app/api/grafana` - Grafana-compatible data endpoint

## Grafana Configuration

To use this API with Grafana:

1. Install the JSON API data source plugin in Grafana (if not already installed)
2. Configure a new data source with the URL of your deployed Vercel API
3. Use the `/api/grafana` endpoint for queries

## Important Notes

- The Firebase credentials are securely stored as an environment variable and decoded at runtime
- Each API call will decode the credentials to a temporary file as needed
- The deployment uses Flask through a WSGI-compatible wrapper for Vercel's serverless functions
- Your existing code remains unchanged - only the deployment configuration is added

## Troubleshooting

If you encounter issues:

1. Check that your Firebase credentials are properly base64-encoded
2. Verify that the `FIREBASE_CREDENTIALS` environment variable is set correctly
3. Check the Vercel deployment logs for any error messages
4. Ensure your Firebase credentials have the necessary permissions to read from your Firestore collections