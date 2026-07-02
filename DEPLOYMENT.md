# GovScheme AI - Cloud Deployment Guide

This document provides instructions on how to deploy the GovScheme AI platform (Frontend, Backend, AI Module, and MySQL Database) to various cloud providers and locally using Docker.

## 1. Local Deployment (Docker Compose)

The easiest way to run the entire stack is via `docker-compose`.

1. **Clone the repository.**
2. **Setup Environment Variables**:
   Copy `.env.example` to `.env` in the root directory and fill in your secrets.
   ```bash
   cp .env.example .env
   ```
3. **Build and Run**:
   ```bash
   docker-compose up --build -d
   ```
4. **Access the Application**:
   - Frontend: `http://localhost:80`
   - Backend API: `http://localhost:5000`
   - AI Module API: `http://localhost:5001`

---

## 2. AWS Deployment (Elastic Container Service - ECS / Fargate)

1. **Push Images to ECR (Elastic Container Registry)**:
   - Create 3 ECR repositories: `govscheme-frontend`, `govscheme-backend`, `govscheme-ai`.
   - Build and push images:
     ```bash
     docker build -t <aws_account_id>.dkr.ecr.<region>.amazonaws.com/govscheme-frontend ./frontend
     docker push <aws_account_id>.dkr.ecr.<region>.amazonaws.com/govscheme-frontend
     # Repeat for backend and ai_module
     ```

2. **Database Setup**:
   - Launch an Amazon RDS MySQL 8 instance.
   - Run the initialization script from `dataset/init.sql` on the RDS instance.
   - Note the Endpoint, Username, and Password.

3. **ECS Cluster & Task Definition**:
   - Create an ECS Cluster.
   - Create a Task Definition (Fargate type) combining Frontend, Backend, and AI Module containers.
   - Pass the RDS Database credentials securely via **AWS Secrets Manager** or standard Environment Variables.
   - Map Port 80 for Frontend, Port 5000 for Backend, and Port 5001 for AI Module.

4. **Run Service & Load Balancer**:
   - Run the task inside a service attached to an Application Load Balancer (ALB) for HTTPS and scalability.

---

## 3. Azure Deployment (Azure App Services / ACI)

1. **Push Images to ACR (Azure Container Registry)**:
   ```bash
   az acr build --registry <YourRegistry> --image govscheme-frontend ./frontend
   # Repeat for backend and ai_module
   ```

2. **Database Setup**:
   - Provision **Azure Database for MySQL flexible server**.
   - Import `dataset/init.sql`.

3. **Deploy Web Apps**:
   - Create 3 separate **Azure App Services (Web App for Containers)** or use **Azure Container Instances (ACI)** with a multi-container Docker Compose file.
   - When using App Service, map the connection strings and `JWT_SECRET` in the **Configuration > Application Settings** tab.

---

## 4. Google Cloud Platform (Cloud Run)

Cloud Run is ideal for serverless stateless container deployment.

1. **Push Images to Artifact Registry**:
   ```bash
   gcloud builds submit --tag gcr.io/<PROJECT_ID>/govscheme-frontend ./frontend
   # Repeat for backend and ai_module
   ```

2. **Database Setup**:
   - Create a **Cloud SQL for MySQL** instance.
   - Import the `dataset/init.sql` file.

3. **Deploy to Cloud Run**:
   - Deploy AI Module:
     ```bash
     gcloud run deploy govscheme-ai --image gcr.io/<PROJECT_ID>/govscheme-ai --port 5001
     ```
   - Deploy Backend (ensure `DB_HOST` is mapped via Cloud SQL Auth Proxy or internal IP, and set `AI_SERVICE_URL` to the URL generated above):
     ```bash
     gcloud run deploy govscheme-backend --image gcr.io/<PROJECT_ID>/govscheme-backend --port 5000
     ```
   - Deploy Frontend (set `VITE_API_BASE_URL` at build time or configure NGINX reverse proxy to point to the backend URL):
     ```bash
     gcloud run deploy govscheme-frontend --image gcr.io/<PROJECT_ID>/govscheme-frontend --port 80 --allow-unauthenticated
     ```

---

## Production Security & Optimization Guidelines

- **Environment Variables**: NEVER commit `.env` files to source control. Use cloud-native secret managers (AWS Secrets Manager, Azure Key Vault, Google Secret Manager).
- **SSL/TLS**: Always use a reverse proxy (like NGINX on ECS or Cloud Run native HTTPS) to terminate SSL. Do not serve traffic over raw HTTP.
- **CORS**: Update `backend/server.js` `cors()` configuration to exclusively allow your production frontend URL instead of `*`.
- **Database Optimization**: Ensure MySQL connection pooling is appropriately sized for your instances in `backend/config/db.js`.
