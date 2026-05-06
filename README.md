# TripScore
Mobile app for registrating mileage on shared cars within a household.

## Run with Docker (local test)

### Option 1: Docker Compose

```bash
docker compose up --build
```

Open: `http://localhost:8080`

Stop:

```bash
docker compose down
```

### Option 2: Docker CLI

Build image:

```bash
docker build -t tripscore:local .
```

Run container:

```bash
docker run --rm -p 8080:80 --name tripscore tripscore:local
```

Open: `http://localhost:8080`
