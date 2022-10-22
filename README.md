## Get started 

## Infrastructure

- App structure
- Database
- Testing
- Dockerfile
- Add logger
- Validation

```bash
curl -XPOST localhost:8080/api/cats -H "Content-type: application/json" -d '{ "name": "puffy" }'

curl -XGET localhost:8080/api/cats/031988ae-3634-4960-ba78-b2685fc5945a
```

```
npm run db:migrate
```