#!/bin/bash

secret_exists=$(docker secret ls | grep ssl_cert | wc -l)

if [ "$secret_exists" -eq "0" ]; then
    echo "Creating SSL certificate secret"
    docker secret create ssl_cert localhost.crt
fi

secret_exists=$(docker secret ls | grep ssl_key | wc -l)

if [ "$secret_exists" -eq "0" ]; then
    echo "Creating SSL key secret"
    docker secret create ssl_key localhost.key
fi
