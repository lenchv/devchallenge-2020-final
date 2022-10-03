## Get started 

First make sure you have an updated docker:

```
> docker -v
Docker version 20.10.17, build 100c701
```

To run the application execute:

```
docker compose up -d
```

After it you should be able to access API:

```
http://127.0.0.1:8080
```

```
# Create update a person

POST /api/people
{
    id: string
    topics: string[]
}
```

```
# Create update trust connections

POST /api/people/<id>/trust_connections
{
    [personId: string]: number
}
```

```
# Broadcast messages

POST /api/people/messages
{
    text: string
    topics: string[]
    from_person_id: string
    min_trust_level: number
}
```
```
# Find the shortest path

POST /api/people/path
{
    text: string
    topics: string[]
    from_person_id: string
    min_trust_level: number
}
```

## Testing 

### Dockerized

First setup `.env` file:

```bash
cp .env.dockerized .env
```

Install modules:

```bash
docker compose run node npm install
```

Now you should be able to execute tests:

```bash
# Unit
docker compose run node npm run test

# End to end
docker compose run node npm run test:e2e
```

#### Locally
If you want run test locally, make sure you have node js 16:

```
> node -v
v16.14.2
```

Then copy `.env`
```bash
cp .env.local .env
```

Install modules:
```
npm i
```

Execute tests:

```bash
# Unit
npm run test

# End to end
npm run test:e2e
```

## Implementation

The current implementation depends on graph traversal algorithms.

To broadcast messages I'm using DFS, but doesn't matter which one to choose. Here is the most important is to retrieve sub-graph.

I tried 3 types of storages [Memory](src/repositories/memory/memory-people.repository.ts), [GraphDB](src/repositories/neo4j/neo4j-people.repository.ts), [NoSQL](src/repositories/mongo/mongo-people.repository.ts).

You can try any of them, but I prefer Mongo one. To set another repo you can bind particular implementation in [app.module.ts](src/app.module.ts):

```
{
    provide: 'PeopleRepository',
    useClass: MongoPeopleRepository, // MemoryPeopleRepository, Neo4jPeopleRepository
}
```

Memory one is fast enough, but I should'v used balanced tree's for storing data. But it is not scalable solution, so I used it only for testing.

Neo4j (GraphDB) works super fast on querying (1M nodes - 20 sec.), but it is super slow on writing. Even though in Neo4j you can find shortest path just with one query.

MongoDB is fast enough on both read and write, so I chose this one, but still on 1M nodes it takes ~2 min to traverse, which much slower than using graph db.

For finding shortest path, I chose breadth-first algorithm, because it works fine to find the shortest path in the graph. The only thing I query all not visited children from DB, because in my opinion it is better not to retrieve whole Graph into the memory to DB and keep retrieving until find the destination node.
