.PHONY: dev dev:server dev:client build test lint typecheck

dev:
	npm run dev

dev:server:
	node server/run-mvn.js spring-boot:run -q

dev:client:
	npm --prefix client run dev

build:
	npm run build

test:
	npm run test

lint:
	npm run lint

typecheck:
	npm run typecheck
