# Firestore to Grafana API

This is a Flask application that serves as an API layer between Firestore and Grafana.

## Deployment Options

### Option 1: Vercel (Recommended for Serverless)

1. Create an account at [Vercel](https://vercel.com)
2. See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed instructions
3. You'll need to base64-encode your Firebase credentials as an environment variable
4. Vercel will automatically detect this as a Python project and use the requirements.txt

### Option 2: Render.com (Free Tier Available)

1. Create an account at [Render](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository (or paste this code directly)
4. Set the environment variables:
   - `FIREBASE_CREDENTIALS_PATH`: Path to your Firebase credentials (usually 'firebase_credentials.json')
5. Render will automatically detect this as a Python project and use the requirements.txt

### Option 3: Railway

1. Create an account at [Railway](https://railway.app)
2. Create a new project
3. Connect your GitHub repository or deploy directly
4. Set environment variables in the dashboard
5. Deploy the project

### Option 4: Heroku

1. Create an account at [Heroku](https://heroku.com)
2. Install the Heroku CLI
3. Create a new app: `heroku create your-app-name`
4. Set the buildpack: `heroku buildpacks:set heroku/python`
5. Deploy: `git push heroku main`

## Environment Variables

You'll need to set these environment variables in your deployment platform:

- `FIREBASE_CREDENTIALS_PATH`: Path to your Firebase credentials file (default: 'firebase_credentials.json')

## Firebase Credentials

For security reasons, you should not commit your Firebase credentials file to your repository. Instead:

1. Base64 encode your firebase_credentials.json file
2. Set it as an environment variable in your deployment platform
3. Decode it in your application at runtime

Example for deployment:
```bash
# Encode the file
export FIREBASE_CREDENTIALS=$(base64 -w 0 firebase_credentials.json)

# In your application, decode and write to a temporary file
echo $FIREBASE_CREDENTIALS | base64 -d > firebase_credentials.json
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/data` - Get all Firestore data
- `POST /api/grafana` - Grafana-compatible data endpoint

## Grafana Configuration

To use this API with Grafana:

1. Install the JSON API data source plugin in Grafana
2. Configure a new data source with the URL of your deployed API
3. Use the `/api/grafana` endpoint for queries