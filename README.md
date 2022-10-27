## Get started 

```
docker compose up -d
docker compose exec app npm run db:migrate
```

## Testing 

Please notice, for e2e testing is used the same database service as for main application,
so it will be erased after running tests.

If you want to avoid this, in `docker-compose.yml` copy `db` service, and use its name as DB_HOST in `.env.testing`

```
cp .env.testing.example .env.testing

docker compose run --rm node npm i

# run db service
docker compose up -d db

# run unit tests
docker compose run --rm node npm run test

# run e2e tests
docker compose run --rm node npm run test:e2e
```

## API Usage

Endpoint: http://localhost:8080

POST /api/cats
{
    name: string
}

### Examples

```bash
curl -XPOST localhost:8080/api/cats -H "Content-type: application/json" -d '{ "name": "puffy" }'

curl -XGET localhost:8080/api/cats/f60a9220-03d9-4d45-8f88-f83d83f67360

curl -XPUT localhost:8080/api/cats/f60a9220-03d9-4d45-8f88-f83d83f67360/owner -H "Content-type: application/json" -d '{ "human": "76f26679-4e74-469f-bf67-ad1e434cb517" }'

curl -XPOST localhost:8080/api/humans -H "Content-type: application/json" -d '{ "name": "nazar", "address": { "city": "Lviv", "street": "Chornovola", "home": "24" } }'

```
