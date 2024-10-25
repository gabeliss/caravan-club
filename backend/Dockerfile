# Use an official Python image from Docker Hub
FROM python:3.11-slim

# Set environment variables for Playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Install necessary system dependencies for Playwright and Chromium
RUN apt-get update && apt-get install -y \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libxcomposite1 \
    libxrandr2 libxdamage1 libxkbcommon0 libgbm1 libasound2 fonts-liberation \
    libxfixes3 libpango-1.0-0 libcairo2 \
    && rm -rf /var/lib/apt/lists/*

# Install pip packages
COPY requirements.txt .
RUN pip install -r requirements.txt

# Install Playwright and Chromium
RUN pip install playwright && playwright install chromium

# Copy your application code
COPY . /app
WORKDIR /app

# Expose the port your app runs on
EXPOSE 5000

# Start your application
CMD ["gunicorn", "-b", "0.0.0.0:5000", "run:app"]
