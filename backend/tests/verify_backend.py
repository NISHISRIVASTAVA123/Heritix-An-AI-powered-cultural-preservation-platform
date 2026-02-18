import wave
import struct
import math
import requests
import time
import json
import os

def create_wav(filename="test_audio.wav"):
    # Create a 1-second tone WAV file (440Hz)
    with wave.open(filename, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(44100)
        data = []
        for i in range(44100):
            value = int(32767.0*math.cos(2.0*math.pi*440.0*i/44100.0))
            data.append(struct.pack('<h', value))
        f.writeframes(b''.join(data))
    print(f"Created {filename}")

def test_flow():
    base_url = "http://localhost:8000"
    
    # 1. Check Health
    try:
        r = requests.get(f"{base_url}/")
        print(f"Server Health: {r.json()}")
    except Exception as e:
        print(f"Server not reachable: {e}")
        return

    # 2. Upload
    create_wav("test_audio.wav")
    print("\n[1] Uploading audio...")
    with open("test_audio.wav", "rb") as f:
        files = {"file": f}
        r = requests.post(f"{base_url}/api/upload-audio", files=files, data={"contributor": "Automated Tester", "consent": "true"})
    
    if r.status_code != 200:
        print(f"Upload failed: {r.text}")
        return
        
    record_id = r.json()["record_id"]
    print(f"Upload successful. Record ID: {record_id}")
    
    # 3. Process
    print(f"\n[2] Triggering processing for {record_id}...")
    r = requests.post(f"{base_url}/api/process/{record_id}")
    if r.status_code != 200:
        print(f"Processing trigger failed: {r.text}")
        return
    print("Processing started successfully.")
    
    # 4. Poll Status
    print("\n[3] Polling status...")
    max_retries = 30
    for i in range(max_retries):
        time.sleep(2)
        try:
            r = requests.get(f"{base_url}/api/status/{record_id}")
            data = r.json()
            status = data.get("status")
            print(f"Create Check {i+1}/{max_retries}: Status = {status}")
            
            if status == "completed":
                print("\n[SUCCESS] Processing Complete!")
                print("Result Preview:", data)
                
                # Double check with Archive Search
                check_archive(base_url, record_id)
                break
            if status == "failed":
                # Check DB for error details if possible using /archive/all or similar logic
                print("\n[FAILED] Processing Failed.")
                break
        except Exception as e:
            print(f"Polling error: {e}")

    # Cleanup or Final check
    if os.path.exists("test_audio.wav"):
        os.remove("test_audio.wav")

def check_archive(base_url, record_id):
    print("\n[4] Verifying in Archive...")
    r = requests.get(f"{base_url}/archive/search?q=Recording") # Search by default title prefix
    records = r.json()
    found = any(rec["_id"] == record_id for rec in records)
    if found:
        print(f"Record {record_id} found in archive.")
    else:
        print(f"Record {record_id} NOT found in archive list.")

if __name__ == "__main__":
    test_flow()
