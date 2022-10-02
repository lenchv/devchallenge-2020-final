curl -XPOST localhost:8080/api/people -H "Content-Type: application/json" -d '{ "id": "Gary", "topics": ["magic","books","movies"] }'
curl -XPOST localhost:8080/api/people -H "Content-Type: application/json" -d '{ "id": "Hermoine", "topics": ["magic","books"] }'
curl -XPOST localhost:8080/api/people -H "Content-Type: application/json" -d '{ "id": "Ron", "topics": ["magic","movies"] }'
curl -XPOST localhost:8080/api/people -H "Content-Type: application/json" -d '{ "id": "Snape", "topics": ["magic","books","poisons"] }'
curl -XPOST localhost:8080/api/people -H "Content-Type: application/json" -d '{ "id": "Voldemort", "topics": ["magic","evil"] }'
curl -XPOST localhost:8080/api/people -H "Content-Type: application/json" -d '{ "id": "Malfoy", "topics": ["magic","books","evil"] }'
curl -XPOST localhost:8080/api/people -H "Content-Type: application/json" -d '{ "id": "Jinnie", "topics": ["magic","movies","books"] }'
curl -XPOST localhost:8080/api/people -H "Content-Type: application/json" -d '{ "id": "Greg", "topics": ["magic","movies"] }'
curl -XPOST localhost:8080/api/people -H "Content-Type: application/json" -d '{ "id": "Beatrice", "topics": ["magic","books"] }'

curl -XPOST localhost:8080/api/people/Gary/trust_connections -H "Content-Type: application/json" -d '{ "Hermoine": 10, "Ron": 10, "Snape": 4, "Voldemort": 1 }'
curl -XPOST localhost:8080/api/people/Hermoine/trust_connections -H "Content-Type: application/json" -d '{ "Gary": 10, "Ron": 10, "Greg": 6 }'
curl -XPOST localhost:8080/api/people/Ron/trust_connections -H "Content-Type: application/json" -d '{ "Gary": 10, "Hermoine": 10, "Jinnie": 9 }'
curl -XPOST localhost:8080/api/people/Malfoy/trust_connections -H "Content-Type: application/json" -d '{ "Snape": 9 }'
curl -XPOST localhost:8080/api/people/Greg/trust_connections -H "Content-Type: application/json" -d '{ "Malfoy": 8 }'
curl -XPOST localhost:8080/api/people/Snape/trust_connections -H "Content-Type: application/json" -d '{ "Beatrice": 8, "Voldemort": 6 }'
curl -XPOST localhost:8080/api/people/Jinnie/trust_connections -H "Content-Type: application/json" -d '{ "Greg": 5, "Ron": 8 }'

curl -XPOST localhost:8080/api/messages -H "Content-Type: application/json" -d '{ "text": "Voldemort is alive", "topics": ["magic"], "from_person_id": "Gary", "min_trust_level": 6 }'

curl -XPOST localhost:8080/api/path -H "Content-Type: application/json" -d '{ "text": "Need a poison, ASAP!", "topics": ["magic", "poisons"], "from_person_id": "Gary", "min_trust_level": 6 }'

curl -XPOST localhost:8080/api/people/Gary/trust_connections -H "Content-Type: application/json" -d '{ "Hermoine": 10, "Ron": 10, "Snape": 6, "Voldemort": 1 }'

curl -XPOST localhost:8080/api/path -H "Content-Type: application/json" -d '{ "text": "Need a poison, ASAP!", "topics": ["magic", "poisons"], "from_person_id": "Gary", "min_trust_level": 6 }'
