import requests
import time
import os

def test_architecture_flow():
    base_url = "http://127.0.0.1:8000"
    
    # Wait for server to be up
    print("Waiting for server...")
    for _ in range(10):
        try:
            requests.get(base_url)
            break
        except:
            time.sleep(1)
    else:
        print("Server not reachable.")
        return

    # Use the same sample or a dummy file
    filename = "test_arch_audio.mp3"
    
    # Create a dummy audio file if not exists (or download)
    if not os.path.exists(filename):
        with open(filename, "wb") as f:
            f.write(os.urandom(1024 * 10)) # 10KB dummy content, might fail STT but pipeline should run
            # Actually, STT will fail on random bytes. Let's try to download a real one or use existing.
            # I will try to download the sample again or just expect STT failure but log persistence.
            pass
    
    # Let's try to download the sample again for a valid test
    audio_url = "https://www.nch.com.au/scribe/practice/audio-sample-1.mp3"
    try:
        r = requests.get(audio_url, timeout=30)
        with open(filename, 'wb') as f:
            f.write(r.content)
        print("Downloaded sample audio.")
    except:
        print("Failed to download, using dummy (expect STT failure).")

    print("\n[1] Uploading audio...")
    try:
        with open(filename, "rb") as f:
            files = {"file": ("test_audio.mp3", f, "audio/mpeg")}
            r = requests.post(f"{base_url}/api/upload-audio", files=files, data={"contributor": "ArchTester", "consent": "true"})
        
        if r.status_code != 200:
            print(f"Upload failed: {r.text}")
            return
            
        record_id = r.json()["record_id"]
        print(f"Upload successful. Record ID: {record_id}")
    except Exception as e:
        print(f"Upload error: {e}")
        return

    print(f"\n[2] Triggering processing for {record_id}...")
    try:
        r = requests.post(f"{base_url}/api/process/{record_id}")
        if r.status_code != 200:
            print(f"Processing trigger failed: {r.text}")
            return
        print("Processing started successfully.")
    except Exception as e:
        print(f"Processing trigger error: {e}")
        return

    print("\n[3] Polling status and checking Logs...")
    max_retries = 30
    for i in range(max_retries):
        time.sleep(2)
        try:
            r = requests.get(f"{base_url}/api/status/{record_id}")
            data = r.json()
            status = data.get("status")
            logs = data.get("logs", [])
            
            print(f"Check {i+1}/{max_retries}: Status = {status}")
            if logs:
                print(f"   Latest Log: {logs[0]['stage']} - {logs[0]['status']}")
            
            if status == "completed":
                print("\n[SUCCESS] Processing Complete!")
                print("Verifying Data Split:")
                print(f"   Metadata Title: {data.get('metadata', {}).get('title')}")
                print(f"   Content Preview exists: {data.get('content_preview')}")
                print(f"   Log Count: {len(logs)}")
                break
            
            if status == "failed":
                print("\n[FAILED] Processing Failed.")
                print(f"   Error Log: {logs[0] if logs else 'No log'}")
                break
        except Exception as e:
            print(f"Polling error: {e}")

    # Cleanup
    if os.path.exists(filename):
        os.remove(filename)

if __name__ == "__main__":
    test_architecture_flow()
