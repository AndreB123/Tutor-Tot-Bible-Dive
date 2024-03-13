#!/bin/bash

# Path to your secrets .env file
#TODO 
SECRETS_FILE=".env.secrets"

# Check if Docker Swarm is initialized
docker info | grep -q 'Swarm: active'
if [ $? -ne 0 ]; then
    echo "Initializing Docker Swarm..."
    docker swarm init
fi

# Create Docker secrets from the .env file
while IFS='=' read -r key value; do
    if [ ! -z "$key" ]; then
        echo "Creating secret for $key..."
        echo -n $value | docker secret create $key -
        if [ $? -ne 0 ]; then
            echo "Error creating secret for $key. It might already exist."
        fi
    fi
done < "$SECRETS_FILE"

echo "Secrets creation completed."
