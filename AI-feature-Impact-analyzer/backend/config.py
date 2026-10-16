import os
from pathlib import Path

# Load .env file automatically if present
def load_dotenv():
    candidate_paths = [
        Path(__file__).resolve().parent / ".env",
        Path(__file__).resolve().parent.parent / ".env",
    ]
    for p in candidate_paths:
        if p.exists():
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip('"').strip("'")
                        if k and k not in os.environ:
                            os.environ[k] = v

load_dotenv()

# Read configuration from environment variables
# OLLAMA_BASE_URL: e.g. http://192.168.1.50:11434 for a second device
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")

# OLLAMA_MODEL: exact model name shown by `ollama list` (e.g. gemma4:12b)
# Prioritizes OLLAMA_MODEL environment variable, falls back to DEFAULT_MODEL or "gemma4:12b"
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", os.getenv("DEFAULT_MODEL", "gemma4:12b"))
DEFAULT_MODEL = OLLAMA_MODEL

API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
REQUEST_TIMEOUT_SECONDS = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "120.0"))

def get_ollama_base_url() -> str:
    return os.getenv("OLLAMA_BASE_URL", OLLAMA_BASE_URL).rstrip("/")

def get_ollama_model() -> str:
    return os.getenv("OLLAMA_MODEL", os.getenv("DEFAULT_MODEL", OLLAMA_MODEL))
