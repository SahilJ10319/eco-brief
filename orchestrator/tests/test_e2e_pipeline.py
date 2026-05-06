import time
import requests

API_URL = "http://localhost:8000/api/v1"

def test_pipeline():
    print("starting end-to-end pipeline verification...")
    try:
        r = requests.get(f"{API_URL}/payloads")
        r.raise_for_status()
        payloads = r.json()
    except Exception as e:
        print(f"failed to connect to api: {e}")
        return
    
    if not payloads:
        print("no payloads found to test.")
        return

    # find first pending payload
    test_target = next((p["key"] for p in payloads if p["status"] == "pending"), None)
    
    if not test_target:
        print("all payloads already processed. upload a new raw payload to test.")
        return

    print(f"selected raw payload: {test_target}")

    print("triggering inference scale-to-zero instance...")
    r = requests.post(f"{API_URL}/inference/trigger", json={"payload_key": test_target, "model_id": "llama-3.2-3b-q4"})
    r.raise_for_status()
    instance_info = r.json()
    print(f"instance launched: {instance_info['instance_id']}")

    print("polling for audio and summary artifacts...")
    max_retries = 30
    for i in range(max_retries):
        r = requests.get(f"{API_URL}/payloads")
        current_payloads = r.json()
        target = next((p for p in current_payloads if p["key"] == test_target), None)
        
        if target and target["status"] == "completed":
            print("pipeline complete. artifacts safely in s3.")
            
            # verify endpoints
            sum_key = test_target.replace("raw/", "")
            r = requests.get(f"{API_URL}/summaries/{sum_key}")
            if r.status_code == 200:
                print("text summary fetched successfully.")
            
            aud_key = sum_key.replace(".txt", "")
            r = requests.get(f"{API_URL}/audio/{aud_key}")
            if r.status_code == 200:
                print("presigned audio url generated successfully.")
                
            return
            
        time.sleep(10)
    
    print("timeout waiting for pipeline completion.")

if __name__ == "__main__":
    test_pipeline()
