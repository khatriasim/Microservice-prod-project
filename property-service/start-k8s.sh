#!/bin/bash

# only start if not already running
if minikube status | grep -q "Running"; then
    echo "Minikube already running!"
else
    echo "Starting minikube..."
    minikube start --driver=docker
    kubectl apply -f k8s/
fi

echo "Starting port-forward..."
echo "Access at http://fastapi.local:8080/docs"
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8080:80 --address 127.0.0.1