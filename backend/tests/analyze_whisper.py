import whisper
import torch
import time
import os
import wave
import struct
import math
import psutil

def create_test_wav(filename="diagnostic_audio.wav"):
    # Create a 2-second synthesized speech-like audio (approx) or just a tone
    # For a real test, a tone is enough to check if the model runs without crashing
    with wave.open(filename, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(16000) # Whisper likes 16k
        data = []
        for i in range(16000 * 2): # 2 seconds
            value = int(32767.0*math.cos(2.0*math.pi*440.0*i/16000.0))
            data.append(struct.pack('<h', value))
        f.writeframes(b''.join(data))
    print(f"Created dummy audio: {filename}")

def analyze_whisper():
    report = {
        "device_available": "unknown",
        "device_used": "unknown",
        "model_load_time": 0,
        "inference_time": 0,
        "transcription_success": False,
        "memory_usage_mb": 0,
        "error": None
    }

    try:
        # 1. Check Hardware
        print("\n[1] Checking Hardware...")
        if torch.cuda.is_available():
            report["device_available"] = f"GPU ({torch.cuda.get_device_name(0)})"
        else:
            report["device_available"] = "CPU"
        print(f"   Available Device: {report['device_available']}")

        # 2. Load Model
        print("\n[2] Loading Whisper Model (small)...")
        start_time = time.time()
        process = psutil.Process(os.getpid())
        mem_before = process.memory_info().rss / 1024 / 1024
        
        model = whisper.load_model("small")
        
        mem_after = process.memory_info().rss / 1024 / 1024
        report["model_load_time"] = round(time.time() - start_time, 2)
        report["memory_usage_mb"] = round(mem_after - mem_before, 2)
        report["device_used"] = str(model.device)
        
        print(f"   Load Time: {report['model_load_time']}s")
        print(f"   RAM Consumed: ~{report['memory_usage_mb']} MB")
        print(f"   Actual Device Used: {report['device_used']}")

        # 3. Inference Test
        print("\n[3] Running Inference Test...")
        create_test_wav()
        
        start_time = time.time()
        result = model.transcribe("diagnostic_audio.wav")
        report["inference_time"] = round(time.time() - start_time, 2)
        report["transcription_success"] = True
        print(f"   Inference Time: {report['inference_time']}s")
        print(f"   Transcript: '{result['text']}'")
        
    except Exception as e:
        report["error"] = str(e)
        print(f"   [ERROR] {e}")
    finally:
        if os.path.exists("diagnostic_audio.wav"):
            os.remove("diagnostic_audio.wav")

    # 4. Final Report
    print("\n" + "="*30)
    print("       DIAGNOSTIC REPORT       ")
    print("="*30)
    print(f"Hardware Detected: {report['device_available']}")
    print(f"Model Run On:      {report['device_used']}")
    print(f"Load Time:         {report['model_load_time']} sec")
    print(f"Inference Time:    {report['inference_time']} sec (for 2s audio)")
    print(f"RAM Impact:        {report['memory_usage_mb']} MB")
    print(f"Status:            {'✅ WORKING' if report['transcription_success'] else '❌ FAILED'}")
    
    if report['transcription_success']:
        if report['device_used'] == 'cpu' and 'GPU' in report['device_available']:
            print("\n[!] WARNING: GPU is available but Whisper is using CPU.")
            print("    Fix: Ensure torch with CUDA is installed (pip install torch --index-url https://download.pytorch.org/whl/cu118).")
        else:
            print("\n[INFO] Configuration looks optimal for this environments.")
    else:
         print(f"\n[!] FAILURE REASON: {report['error']}")

if __name__ == "__main__":
    analyze_whisper()
