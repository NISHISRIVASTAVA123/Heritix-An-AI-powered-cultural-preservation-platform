from fastapi import APIRouter
from agents.agent_manager import AgentManager
from pydantic import BaseModel

router = APIRouter()
agent_manager = AgentManager()

class AgentRequest(BaseModel):
    text: str

@router.post("/process")
async def process_text_with_agents(request: AgentRequest):
    results = await agent_manager.run_pipeline(request.text)
    return results
