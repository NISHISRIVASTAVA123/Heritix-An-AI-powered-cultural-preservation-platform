from fastapi import APIRouter
from agents.agent_manager import AgentManager
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()
agent_manager = AgentManager()

class AgentRequest(BaseModel):
    """Pydantic model representing the expected request body for agent processing."""
    text: str

@router.post("/process")
async def process_text_with_agents(request: AgentRequest) -> Dict[str, Any]:
    """
    Process the input text through the agent manager's full pipeline.

    Args:
        request (AgentRequest): The text request payload.

    Returns:
        Dict[str, Any]: Execution results from all pipeline agents.
    """
    results = await agent_manager.run_pipeline(request.text)
    return results
