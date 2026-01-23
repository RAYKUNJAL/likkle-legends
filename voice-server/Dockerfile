
# Use NVIDIA's PyTorch base image with CUDA support
FROM pytorch/pytorch:2.2.0-cuda12.1-cudnn8-runtime

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install build tools just in case
RUN pip install --upgrade pip

# Install Moshi/PersonaPlex from git
# Note: We use the official Repo logic
RUN pip install git+https://github.com/kyutai-labs/moshi.git

# Install additional dependencies
RUN pip install sentencepiece

# Expose the WebSocket port
EXPOSE 8998

# Set environment variable for the model cache (optional)
ENV HF_HOME=/app/cache

# Create a start script
RUN echo '#!/bin/bash\npython -m moshi.server --host 0.0.0.0 --port 8998' > /app/start.sh
RUN chmod +x /app/start.sh

# Default command
CMD ["/app/start.sh"]
