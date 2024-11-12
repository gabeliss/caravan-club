.PHONY: start-backend-dev start-frontend-dev run-dev build-docker start-docker start-frontend build-frontend run-docker

# Command to run the backend in a new Terminal tab (development mode with virtual environment)
start-backend-dev:
	osascript -e 'tell application "Terminal" to do script "cd '$(PWD)' && source venv/bin/activate && cd backend && python3 run.py"'

# Command to run the frontend in a new Terminal tab (development mode)
start-frontend-dev:
	osascript -e 'tell application "Terminal" to do script "cd '$(PWD)'/frontend && npm run start-dev"'

# Command to start both frontend and backend in development mode
run-dev: start-backend-dev start-frontend-dev

# Command to build Docker image for the backend
build-docker:
	cd backend && docker build -t backend .

# Command to run the backend in a Docker container
start-docker:
	docker run -p 127.0.0.1:5000:5000 backend

# Command to build the frontend
build-frontend:
	cd frontend && npm install && npm run build

# Command to start the frontend in production mode
start-frontend:
	cd frontend && serve -s build

# Command to start both frontend and backend
run-docker: build-docker build-frontend
	make -j2 start-docker start-frontend

