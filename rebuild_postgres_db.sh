#!/bin/bash

STACK_NAME="BibleDive"

# Step 1: Stop and remove the stack
docker stack rm $STACK_NAME

# Step 2: Wait for the stack to stop completely
echo "Waiting for stack to stop completely..."
sleep 30

# Step 3: Remove the volume
docker volume rm ${STACK_NAME}_postgres-data

# Step 4: Rebuild and redeploy the stack
./docker_build.sh