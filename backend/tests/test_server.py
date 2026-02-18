import sys
import os

# Add current directory to sys.path
sys.path.append(os.getcwd())

print("Attempting to import main...")
try:
    from main import app
    print("Successfully imported main.")
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"Failed to import main: {e}")
