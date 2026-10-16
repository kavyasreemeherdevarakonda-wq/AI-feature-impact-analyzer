import uvicorn
from config import API_HOST, API_PORT

if __name__ == "__main__":
    print(f"Starting AI Feature Impact Analyzer API on http://{API_HOST}:{API_PORT}")
    print(f"API Documentation available at: http://{API_HOST}:{API_PORT}/docs")
    uvicorn.run("main:app", host=API_HOST, port=API_PORT, reload=False)
