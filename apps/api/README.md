# CRM Healthcare API

Backend API untuk CRM Healthcare/Pharmaceutical Platform menggunakan Go dan Gin framework.

## Tech Stack

- **Go**: 1.23+
- **Gin**: Web framework
- **PostgreSQL**: Database (akan ditambahkan)
- **Docker**: Containerization

## Setup Development

### Prerequisites

- Go 1.23 or higher
- Docker & Docker Compose (optional)

### Local Development

1. Install dependencies:
```bash
go mod download
```

2. Run the server:
```bash
go run cmd/server/main.go
```

Server akan berjalan di `http://localhost:8080`

### Docker Development

1. Build and run with Docker Compose:
```bash
docker-compose up --build
```

2. Atau build image manually:
```bash
docker build -t crm-healthcare-api .
docker run -p 8080:8080 crm-healthcare-api
```

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint

### Ping
- `GET /ping` - Ping endpoint (example)

### API v1
- `GET /api/v1/` - API version info

## Project Structure

```
apps/api/
├── cmd/
│   └── server/
│       └── main.go          # Application entry point
├── internal/
│   ├── api/                 # API handlers
│   ├── middleware/          # Custom middleware
│   └── config/              # Configuration
├── pkg/
│   ├── response/            # Response helpers
│   └── errors/              # Error handling
├── go.mod
├── go.sum
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Development Guidelines

- Follow Go best practices and conventions
- Use the API response standards defined in `/docs/api-standart/`
- Implement error codes as defined in `/docs/api-standart/api-error-codes.md`
- Support bilingual error messages (ID & EN)

## Next Steps

- [ ] Setup database connection (PostgreSQL)
- [ ] Implement authentication middleware
- [ ] Create base API response helpers
- [ ] Setup error handling
- [ ] Implement user model and migration

