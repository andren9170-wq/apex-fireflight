#!/bin/bash
# Simple development server
echo "Starting Apex Firefight dev server on http://localhost:8000"
python3 -m http.server 8000 --bind 0.0.0.0
