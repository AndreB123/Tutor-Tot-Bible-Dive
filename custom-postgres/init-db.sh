set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<- EOSQL
    CREATE DATABASE "BDChat-Service";
    CREATE DATABASE "BDUser-Sub-Service";
EOSQL