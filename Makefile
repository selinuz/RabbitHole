.PHONY: dev client server install install-client install-server build

# Run both frontend and backend concurrently
dev:
	@echo "Starting full stack..."
	@(trap 'kill 0' SIGINT; \
		cd server && npm run dev & \
		cd client && npm run dev & \
		wait)

# Run only the frontend (Vite)
client:
	cd client && npm run dev

# Run only the backend (nodemon)
server:
	cd server && npm run dev

# Install dependencies for both
install: install-client install-server

install-client:
	cd client && npm install

install-server:
	cd server && npm install

# Build frontend for production
build:
	cd client && npm run build
