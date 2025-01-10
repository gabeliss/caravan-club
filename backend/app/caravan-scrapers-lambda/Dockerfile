FROM python:3.11-bullseye

# Install dependencies
RUN apt-get update && apt-get install -y \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxrandr2 \
    libasound2 \
    libxss1 \
    libgtk-3-0 \
    libgbm-dev \
    fonts-noto-color-emoji \
    && apt-get clean

# Upgrade pip and install Playwright
RUN pip install --upgrade pip && \
    pip install playwright

# Set the browser path to ensure Lambda knows where to look
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright-browsers
RUN playwright install chromium

# Print installed browsers for debugging
RUN ls -R /ms-playwright-browsers

# Copy the Lambda handler to /app directory
COPY handler.py /app/handler.py
COPY scrapers /app/scrapers

# Set the Lambda handler entry point
CMD ["python3", "/app/handler.py"]
