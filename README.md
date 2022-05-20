# innovation-simulator
Prerequisites:
- kubectl CLI working.
- Functioning deployed Kubernetes cluster.
- Dapr & Dapr CLI: ```wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash```
- Install Ingress: ```kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.2.0/deploy/static/provider/cloud/deploy.yaml```

Deploying microservices:
- Install Dapr components: ```dapr init -k```
- Create namespace: ```kubectl create namespace node-docker```
- Deploy redis && redis store: ```kuberctl apply -f redis.yml``` && ```kuberctl apply -f redis-state.yaml```
- Select namespace created above: ```kubectl config set-context --current --namespace=node-docker```
- Clone this repo. Go to the innovation-simulator folder: ```cd ~/innovation-simulator```
- Deploy node-docker-api: ```kuberctl apply -f node-docker-deployment.yaml```
- Deploy node-docker-api-2: ```kubectl apply -f node-docker-deployment-2.yaml```
- Create load balancer for node-docker-api: ```kubectl expose deployment node-docker-api --type=LoadBalancer```
- Create clusterIP for node-docker-api-2: ```kubectl expose deployment node-docker-api-2```
- Deploy Ingress: ```kubectl apply -f ingress.yaml```
- Deploy Dashboard: ```kuberctl apply -f simulator-dashboard.yml```
- Deploy service account: ```kuberctl apply -f simulator-dashboard-svcacc.yml```
- Port forward traffic from host computer to dashboard: ```kubectl port-forward deployment/simulator-dashboard 3333```
- Port forward traffic from host computer to dapr dashboard (logging & tracing): ```kubectl port-forward deployment/dapr-dashboard -n dapr-system 3334:8080```
- Port forward traffic from host computer to Ingress: ```kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 8080:80```
- Browse localhost:8080 for direct API (for any endpoing testing via localhost/Postman)
- Browse localhost:3333 for dashboard
- Browse localhost:3334 for Dapr dashboard
