#!/bin/bash

docker stop testdb
docker rm testdb

# Before running the following command make sure there is a volume called testdbdata
# Use the following command to create one:
# docker volume create testdbdata
# To remove a volume use:
# docker volume rm testdbdata

docker run --name testdb \
-e POSTGRES_PASSWORD=postgres123 \
-p 5432:5432 \
-v /Users/ozgurdenizdemir/Desktop/e-commerce/database/init-scripts:/docker-entrypoint-initdb.d \
-v testdbdata:/var/lib/postgresql/data \
-d postgres

# Please note that you might have to change the file permission of this script file to make it executable.
# You can use the following command to do so:
# chmod +x initialize-database.sh