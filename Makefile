.PHONY: dev dev:server dev:client build test lint typecheck

dev:
	npm run dev

dev:server:
	cd server && .\mvnw.cmd spring-boot:run -q

dev:client:
	npm run dev -w client

build:
	npm run build

test:
	npm run test

lint:
	npm run lint

typecheck:
	npm run typecheck
