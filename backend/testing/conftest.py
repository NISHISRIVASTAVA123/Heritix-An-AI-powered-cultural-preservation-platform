import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add the backend directory to sys.path so imports work correctly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app

@pytest.fixture
def client():
    """Returns a FastAPI TestClient instance."""
    return TestClient(app)
