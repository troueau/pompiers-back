install:
	docker compose -f docker/docker-compose.builder.yml run --rm install
dev:
	docker compose -f docker/docker-compose.yml up
stop:
	docker compose -f docker/docker-compose.yml down
