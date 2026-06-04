# Variables
BACKEND_DIR=fastapi_backend
FRONTEND_DIR=nextjs-frontend
DOCKER_COMPOSE=docker compose

# Help
.PHONY: help
help:
	@echo "Available commands:"
	@awk '/^[a-zA-Z_-]+:/{split($$1, target, ":"); print "  " target[1] "\t" substr($$0, index($$0,$$2))}' $(MAKEFILE_LIST)

# Backend commands
.PHONY: start-backend test-backend

start-backend: ## Start the backend server with FastAPI and hot reload
	cd $(BACKEND_DIR) && ./start.sh

test-backend: ## Run backend tests locally using pytest via uv
	cd $(BACKEND_DIR) && uv run pytest


# Frontend commands
.PHONY: start-frontend test-frontend

start-frontend: ## Start the frontend server with pnpm and hot reload
	cd $(FRONTEND_DIR) && ./start.sh

test-frontend: ## Run frontend tests using pnpm
	cd $(FRONTEND_DIR) && pnpm run test


# Docker commands
.PHONY: docker-backend-shell docker-frontend-shell docker-build docker-build-backend \
        docker-build-frontend docker-up docker-down docker-clean-up docker-start-backend \
        docker-start-frontend docker-up-test-db docker-migrate-db docker-db-schema \
        docker-test-backend docker-test-frontend docker-up-mailhog


docker-backend-shell: ## Access the running backend container shell
	$(DOCKER_COMPOSE) exec backend sh

docker-frontend-shell: ## Access the running frontend container shell
	$(DOCKER_COMPOSE) exec frontend sh

docker-build: ## Build all the services smartly (leveraging layer cache)
	$(DOCKER_COMPOSE) build

docker-build-backend: ## Build just the backend container (leveraging layer cache)
	$(DOCKER_COMPOSE) build backend

docker-build-frontend: ## Build just the frontend container (leveraging layer cache)
	$(DOCKER_COMPOSE) build frontend

docker-up: ## Spin up all services in the background
	$(DOCKER_COMPOSE) up -d

docker-down: ## Stop all services gracefully
	$(DOCKER_COMPOSE) down

docker-clean-up: ## Hard reset: stops services and WIPES out cached volumes (Use when updating dependencies!)
	$(DOCKER_COMPOSE) down -v
	$(DOCKER_COMPOSE) up -d --build

docker-start-backend: ## Start the backend container in the foreground
	$(DOCKER_COMPOSE) up backend

docker-start-frontend: ## Start the frontend container in the foreground
	$(DOCKER_COMPOSE) up frontend

docker-up-test-db: ## Start the test database container
	$(DOCKER_COMPOSE) up db_test

docker-migrate-db: ## Run database migrations using Alembic inside the running environment
	$(DOCKER_COMPOSE) exec backend alembic upgrade head

docker-db-schema: ## Generate a new migration schema. Usage: make docker-db-schema migration_name="add users"
	$(DOCKER_COMPOSE) exec backend alembic revision --autogenerate -m "$(migration_name)"

docker-test-backend: ## Run tests inside the running backend container environment
	$(DOCKER_COMPOSE) exec backend pytest

docker-test-frontend: ## Run tests inside the running frontend container environment
	$(DOCKER_COMPOSE) exec frontend pnpm run test

docker-up-mailhog: ## Start mailhog server
	$(DOCKER_COMPOSE) up mailhog