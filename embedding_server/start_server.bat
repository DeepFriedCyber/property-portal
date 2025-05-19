@echo off
echo Starting Embedding Service...
call venv\Scripts\activate
uvicorn embedding_server:app --host 0.0.0.0 --port 5000 --reload