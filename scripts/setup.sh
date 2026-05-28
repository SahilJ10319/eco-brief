#!/bin/bash
set -e

echo "==> ecobrief server setup"
echo "==> run this script on a fresh amazon linux 2023 t2.micro after cloning the repo"
echo ""

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ] || [ -z "$AWS_DEFAULT_REGION" ]; then
    echo "ERROR: set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_DEFAULT_REGION before running"
    exit 1
fi

echo "==> installing system dependencies"
sudo yum update -y
sudo yum install -y docker nginx git

echo "==> starting docker"
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

echo "==> installing node for frontend build"
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

echo "==> building frontend"
cd frontend
npm install
VITE_API_URL="/api/v1" npm run build
cd ..

echo "==> deploying frontend to nginx"
sudo mkdir -p /usr/share/nginx/html
sudo cp -r frontend/dist/* /usr/share/nginx/html/

sudo tee /etc/nginx/conf.d/ecobrief.conf > /dev/null <<'NGINXCONF'
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 120s;
    }
}
NGINXCONF

sudo systemctl restart nginx
sudo systemctl enable nginx
echo "==> nginx running"

echo "==> building orchestrator docker image"
cd orchestrator

if [ ! -f ".env" ]; then
    echo "ERROR: orchestrator/.env not found. copy .env.example and fill in your values."
    exit 1
fi

sudo docker build -t ecobrief-orchestrator .
sudo docker run -d \
    --restart always \
    --name ecobrief-orchestrator \
    -p 8000:8000 \
    --env-file .env \
    ecobrief-orchestrator
cd ..
echo "==> orchestrator running on port 8000"

echo "==> building ingestion service docker image"
cd ingestion-service
sudo docker build -t ecobrief-ingestion .
sudo docker run -d \
    --restart always \
    --name ecobrief-ingestion \
    -e AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION \
    -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
    -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
    ecobrief-ingestion
cd ..
echo "==> ingestion service running"

echo ""
echo "==> setup complete"
echo "==> frontend:    http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "==> api health:  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/api/v1/health"
echo ""
echo "==> next: build the inference ami using scripts/build_inference_ami.sh"
