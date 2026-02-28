# Deployment & CI/CD Guide

This guide describes how to deploy the Multi-Company SaaS Platform to production.

## 1. Hosting Options
- **Backend:** AWS ECS, DigitalOcean App Platform, Render, or a VPS (EC2/Droplet) running Docker.
- **Database:** Managed PostgreSQL (AWS RDS, DigitalOcean Managed DB, Supabase). Do NOT run databases in Docker on a single VPS for serious production use, use a managed service.
- **Frontend:** Vercel, Netlify, or AWS Amplify.

## 2. Environment Variables Security
In production, your `.env` file should contain strong secrets. Never commit this to Git:
```env
DATABASE_URL=postgresql://user:strong_password@host:5432/db_name
JWT_SECRET=use-a-strong-32-byte-hex-string-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

## 3. CI/CD Pipeline (GitHub Actions Example)
Create a `.github/workflows/deploy.yml` file to automate testing and deployments.

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.12'
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        cd backend && pip install -r requirements.txt
    - name: Run Tests
      # If you have pytest configured:
      run: cd backend && pytest

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    - name: Login to DockerHub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}
    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: yourusername/saas-backend:latest
```

## 4. Production Best Practices checklist
- [ ] **HTTPS/TLS**: Use an API Gateway or Nginx Reverse Proxy with Let's Encrypt for SSL termination.
- [ ] **Database Migrations**: Use Alembic to handle DB schema changes (`alembic upgrade head`) before spinning up the app servers.
- [ ] **CORS Settings**: Update `allow_origins` in `main.py` rigidly to your production frontend URL (e.g., `https://app.yourdomain.com`).
- [ ] **Rate Limiting**: Integrate `slowapi` or an Nginx rate limit to protect your `/auth/login` endpoint from brute force.
- [ ] **Observability**: Send your structured JSON logs to Datadog, AWS CloudWatch, or ELK Stack using a log shipper.
- [ ] **Backups**: Ensure your managed Postgres has automated daily point-in-time recovery (PITR) backups enabled.
