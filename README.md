
# Personal Media Tracker

This project allows you to track your personal media consumption, including music, books, articles, and more. It provides a web interface to visualize your data and gain insights into your habits.

## Features

*   **Data Ingestion**: A pipeline to ingest data from various sources.
*   **Backend API**: A Flask-based API to serve the data.
*   **Frontend**: A React-based frontend to visualize the data.
*   **Dashboard**: A Grafana dashboard for advanced data analysis.

## Architecture

The project is divided into three main components:

1.  **Data Ingestion**: The `run_pipeline.py` script is responsible for collecting data and storing it in Firebase.
2.  **Backend API**: The `api/` directory contains a Flask application that provides a RESTful API to access the data stored in Firebase.
3.  **Frontend**: The `frontend/` directory contains a React application that consumes the API and displays the data in a user-friendly way.

## Prerequisites

Before you begin, ensure you have the following installed:

*   [Python](https://www.python.org/) (version 3.8 or higher)
*   [Node.js](https://nodejs.org/) (version 14 or higher)
*   [pip](https://pip.pypa.io/en/stable/installation/)
*   [npm](https://www.npmjs.com/get-npm)
*   A [Firebase](https://firebase.google.com/) project.

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/tg_ingestion.git
cd tg_ingestion
```

### 2. Set up Firebase

1.  Create a new project on the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new Realtime Database.
3.  Go to **Project settings** > **Service accounts**.
4.  Click **Generate new private key** and save the JSON file as `firebase_credentials.json` in the root of the project.

### 3. Set up the Backend API

1.  Navigate to the `api/` directory:
    ```bash
    cd api
    ```
2.  Create and activate a virtual environment:
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    ```
3.  Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
4.  Create a `.env` file in the `api/` directory with the following content:
    ```
    FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
    ```
    Replace `your-project-id` with your Firebase project ID.

### 4. Set up the Frontend

1.  Navigate to the `frontend/` directory:
    ```bash
    cd ../frontend
    ```
2.  Install the required npm packages:
    ```bash
    npm install
    ```
3.  Create a `.env.local` file in the `frontend/` directory with the following content:
    ```
    VITE_API_URL=http://127.0.0.1:5000
    ```

### 5. Run the Data Ingestion Pipeline

1.  Navigate to the root of the project:
    ```bash
    cd ..
    ```
2.  Create and activate a virtual environment:
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    ```
3.  Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the pipeline:
    ```bash
    python run_pipeline.py
    ```

## Usage

1.  **Start the Backend API**:
    ```bash
    cd api
    source .venv/bin/activate
    flask run
    ```
    The API will be running at `http://127.0.0.1:5000`.

2.  **Start the Frontend**:
    ```bash
    cd ../frontend
    npm run dev
    ```
    The frontend will be running at `http://localhost:5173`.

3.  Open your browser and navigate to `http://localhost:5173` to see the application.

## Deployment

The `render.yaml` and `vercel.json` files are included for deploying the backend and frontend to Render and Vercel, respectively. You will need to configure the environment variables in your chosen platform.

### Vercel (Frontend)

1.  Create a new project on Vercel and connect it to your GitHub repository.
2.  Set the build command to `npm run build`.
3.  Set the output directory to `dist`.
4.  Add the `VITE_API_URL` environment variable with the URL of your deployed backend.

### Render (Backend)

1.  Create a new Web Service on Render and connect it to your GitHub repository.
2.  Set the runtime to Python 3.
3.  Set the build command to `pip install -r requirements.txt`.
4.  Set the start command to `gunicorn app:app`.
5.  Add the `FIREBASE_DATABASE_URL` environment variable.
6.  Add the `firebase_credentials.json` as a secret file.
