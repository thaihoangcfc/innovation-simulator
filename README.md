# innovation-simulator
Prerequisites:
- kubectl CLI working.
- Functioning deployed Kubernetes cluster.
- Dapr & Dapr CLI: dapr init -k
- Install Ingress: kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.2.0/deploy/static/provider/cloud/deploy.yaml

Deploying microservices:
- Install Dapr components: wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
- Create namespace: kubectl create namespace node-docker
- Select namespace (just created): kubectl config set-context --current --namespace=node-docker
- Clone this repo. Go to the innovation-simulator folder: cd ~/innovation-simulator
- Deploy node-docker-api: kuberctl apply -f node-docker-deployment.yaml
- Deploy node-docker-api-2: kubectl apply -f node-docker-deployment-2.yaml
- Create load balancer for node-docker-api: kubectl expose deployment node-docker-api --type=LoadBalancer
- Create clusterIP for node-docker-api-2: kubectl expose deployment node-docker-api-2
- Deploy Ingress: 
- Port forward traffic from host computer to Ingress: kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 8080:80
- Browse localhost:8080
