import requests
import time
import os
import shutil

def test_sample_flow():
    base_url = "http://localhost:8000"
    audio_url = "https://www.nch.com.au/scribe/practice/audio-sample-1.mp3"
    filename = "test_sample_audio.mp3"

    print(f"Downloading sample audio from {audio_url}...")
    try:
        # Added timeout
        r = requests.get(audio_url, timeout=30)
        with open(filename, 'wb') as f:
            f.write(r.content)
        print("Download complete.")
    except Exception as e:
        print(f"Failed to download audio: {e}")
        # Create a dummy file if download fails just to test the rest of the flow logic
        # (Though content won't be english)
        return

    print("\n[1] Uploading audio...")
    try:
        with open(filename, "rb") as f:
            files = {"file": f}
            r = requests.post(f"{base_url}/api/upload-audio", files=files, data={"contributor": "Tester", "consent": "true"})
        
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

    print("\n[3] Polling status...")
    max_retries = 60
    success = False
    for i in range(max_retries):
        time.sleep(2)
        try:
            r = requests.get(f"{base_url}/api/status/{record_id}")
            data = r.json()
            status = data.get("status")
            print(f"Check {i+1}/{max_retries}: Status = {status}")
            
            if status == "completed":
                print("\n[SUCCESS] Processing Complete!")
                success = True
                break
            if status == "failed":
                print("\n[FAILED] Processing Failed.")
                break
        except Exception as e:
            print(f"Polling error: {e}")

    if success:
        print("\n[4] Fetching Full Record Validation...")
        try:
             # Search by ID would be ideal, but for now we search list
             r = requests.get(f"{base_url}/archive/search?q=Recording")
             for rec in r.json():
                 if rec["_id"] == record_id:
                     print(f"Record found in Archive!")
                     print(f"Detected Language: {rec.get('detected_language')}")
                     print(f"Category: {rec.get('category')}")
                     print(f"Transcript Preview: {rec.get('transcript')[:100]}...")
                     break
        except Exception as e:
            print(f"Archive check failed: {e}")

    # Cleanup
    if os.path.exists(filename):
        os.remove(filename)

if __name__ == "__main__":
    test_sample_flow()
