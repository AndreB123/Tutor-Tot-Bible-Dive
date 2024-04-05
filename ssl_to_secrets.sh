#!/bin/bash

secret_exists=$(docker secret ls | grep ssl_cert | wc -l)

if [ "$secret_exists" -eq "0" ]; then
    echo "Creating SSL certificate secret"
    docker secret create ssl_cert localhost+3.pem
fi

secret_exists=$(docker secret ls | grep ssl_key | wc -l)

if [ "$secret_exists" -eq "0" ]; then
    echo "Creating SSL key secret"
    docker secret create ssl_key localhost+3-key.pem
fi
