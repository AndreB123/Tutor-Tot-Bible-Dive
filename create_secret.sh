#!/bin/bash

# Path to secrets .env file
SECRETS_FILE="envs.env_file"

# Check if Docker Swarm is initialized
docker info | grep -q 'Swarm: active'
if [ $? -ne 0 ]; then
    echo "Initializing Docker Swarm..."
    docker swarm init
fi

# Function to create a Docker secret
create_secret() {
    local key=$1
    local value=$2

    echo "Creating secret for $key..."
    echo -n $value | docker secret create $key -
    if [ $? -ne 0 ]; then
        echo "Error creating secret for $key."
    fi
}

# Stop all services
services=$(docker service ls --format '{{.Name}}')
for service in $services; do
    echo "Stopping service $service..."
    docker service rm $service
done

# Remove existing secrets
while IFS='=' read -r key _; do
    if [ ! -z "$key" ]; then
        echo "Removing secret $key if it exists..."
        docker secret rm $key 2>/dev/null
    fi
done < "$SECRETS_FILE"

# Create new secrets from the .env file
while IFS='=' read -r key value; do
    if [ ! -z "$key" ]; then
        create_secret $key $value
    fi
done < "$SECRETS_FILE"

# Start all services
./docker_build.sh

echo "Secrets creation or update completed and services restarted."