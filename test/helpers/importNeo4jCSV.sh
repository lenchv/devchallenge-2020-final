#!/bin/bash

docker compose exec neo4j neo4j-admin import \
    --database neo4j \
    --nodes=Person=/var/lib/neo4j/import/neo4j_scripts/people.csv \
    --relationships=TRUSTS=/var/lib/neo4j/import/neo4j_scripts/relations.csv \
    --force

docker compose restart neo4j
