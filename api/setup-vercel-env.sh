#!/bin/bash

echo "Firebase Credentials Setup for Vercel Deployment"
echo "==============================================="

echo
echo "Before proceeding, you need your Firebase service account JSON file."
echo "This is typically named something like 'your-project-firebase-adminsdk-xxxxx.json'"
echo

read -p "Enter the path to your Firebase service account JSON file: " firebase_file

if [ ! -f "$firebase_file" ]; then
    echo "Error: File does not exist: $firebase_file"
    exit 1
fi

echo
echo "Encoding your Firebase credentials to base64..."
firebase_b64=$(base64 -i "$firebase_file")
echo "Encoded successfully!"

echo
echo "Adding FIREBASE_CREDENTIALS to your Vercel project..."
echo "$firebase_b64" | vercel env add FIREBASE_CREDENTIALS production

if [ $? -eq 0 ]; then
    echo
    echo "✅ Firebase credentials have been successfully added to your Vercel project!"
    echo
    echo "Your application should now be able to access Firebase in production."
    echo
    echo "To verify the deployment is working, visit:"
    echo "https://firestore-to-grafana-api.vercel.app/api/health"
    echo
else
    echo "❌ Failed to add environment variable to Vercel"
    exit 1
fi

echo "Deployment complete!"