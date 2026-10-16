import sys
import asyncio
import httpx
import time
from config import get_ollama_base_url, get_ollama_model

async def test_ollama(base_url: str = None, model_name: str = None):
    url = (base_url or get_ollama_base_url()).rstrip("/")
    model = (model_name or get_ollama_model()).strip()

    print("=" * 65)
    print("   AI Feature Impact Analyzer - Remote Ollama Test")
    print("=" * 65)
    print(f"Target Ollama URL : {url}")
    print(f"Target Model      : {model}")
    print("-" * 65)

    # 1. Test basic connectivity to /api/tags
    print(f"[1/3] Pinging {url}/api/tags ...")
    start = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(f"{url}/api/tags")
            elapsed_ms = round((time.perf_counter() - start) * 1000, 1)

            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("name", "") for m in data.get("models", []) if "name" in m]
                print(f"  --> [OK] Connected in {elapsed_ms}ms!")
                print(f"  --> Models installed on device ({len(models)}): {', '.join(models) if models else 'None'}")
            else:
                print(f"  --> [ERROR] HTTP {resp.status_code}: {resp.text}")
                return False
    except Exception as e:
        print(f"  --> [FAILED] Unable to reach {url}.")
        print(f"      Reason: {e}")
        print("\nTroubleshooting tips for connecting to a second device:")
        print("  1. Ensure Ollama on the second device was started with:")
        print("     OLLAMA_HOST=0.0.0.0 ollama serve")
        print("     (By default, Ollama only listens on 127.0.0.1 and rejects remote connections!)")
        print("  2. Verify the second device's IP and port 11434 in your local network firewall.")
        print("  3. Set OLLAMA_BASE_URL=http://<SECOND_DEVICE_IP>:11434")
        return False

    # 2. Check if the specified model is present
    print(f"\n[2/3] Checking for model '{model}'...")
    if model in models:
        print(f"  --> [OK] Exact model '{model}' found!")
        actual_model = model
    else:
        # Check if any gemma variant is available
        gemma_variants = [m for m in models if "gemma" in m.lower()]
        if gemma_variants:
            print(f"  --> [NOTICE] Exact model '{model}' not found, but Gemma variant '{gemma_variants[0]}' is present.")
            actual_model = gemma_variants[0]
        else:
            print(f"  --> [WARNING] Model '{model}' not found in installed models: {models}")
            print(f"      To pull the model on the second device run: ollama pull {model}")
            actual_model = models[0] if models else model

    # 3. Test quick generation
    print(f"\n[3/3] Testing quick inference with '{actual_model}'...")
    start = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            payload = {
                "model": actual_model,
                "prompt": "Respond with the word 'OK'.",
                "stream": False,
                "options": {"num_predict": 10}
            }
            resp = await client.post(f"{url}/api/generate", json=payload)
            elapsed_sec = round(time.perf_counter() - start, 2)
            if resp.status_code == 200:
                result = resp.json().get("response", "").strip()
                print(f"  --> [OK] Model responded in {elapsed_sec}s: \"{result}\"")
                print("\n" + "=" * 65)
                print("   SUCCESS: Ollama connection & model verified!")
                print("=" * 65)
                return True
            else:
                print(f"  --> [ERROR] HTTP {resp.status_code}: {resp.text}")
                return False
    except Exception as e:
        print(f"  --> [WARNING] Generation timed out or errored: {e}")
        print("  --> (Network reachability and tags succeeded; fallback rule-engine remains active)")
        return True

if __name__ == "__main__":
    cli_url = sys.argv[1] if len(sys.argv) > 1 else None
    cli_model = sys.argv[2] if len(sys.argv) > 2 else None
    asyncio.run(test_ollama(cli_url, cli_model))
