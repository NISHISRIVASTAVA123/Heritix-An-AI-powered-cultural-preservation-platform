import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_archive_api():
    print("--- Verifying Archive API for Frontend ---")
    
    # 1. Test /archive/all
    try:
        print("[1] GET /archive/all")
        resp = requests.get(f"{BASE_URL}/archive/all")
        resp.raise_for_status()
        records = resp.json()
        print(f"    Found {len(records)} records")
        
        if records:
            first = records[0]
            print("    Sample Record Keys:", first.keys())
            # Check for required frontend fields
            required_fields = ["_id", "title", "category", "contributor", "transcript", "created_at"]
            missing = [f for f in required_fields if f not in first]
            if missing:
                print(f"    [FAIL] Missing keys in /all: {missing}")
                sys.exit(1)
            else:
                print("    [PASS] /all structure valid")
                
            record_id = first["_id"]
            
            # 2. Test /archive/{id}
            print(f"[2] GET /archive/{record_id}")
            resp_detail = requests.get(f"{BASE_URL}/archive/{record_id}")
            resp_detail.raise_for_status()
            detail = resp_detail.json()
            print("    Detail Keys:", detail.keys())
            
            # Check for content fields
            content_fields = ["education_data", "translations", "context_data"]
            present = [f for f in content_fields if detail.get(f) is not None]
            print(f"    Present Content Fields: {present}")
            
            if "_id" in detail and detail["_id"] == record_id:
                print("    [PASS] /archive/{id} returned correct record")
            else:
                print("    [FAIL] ID mismatch or missing")
        else:
            print("    [WARN] No records to test detail view. Run upload test first.")

    except Exception as e:
        print(f"    [ERROR] {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_archive_api()
