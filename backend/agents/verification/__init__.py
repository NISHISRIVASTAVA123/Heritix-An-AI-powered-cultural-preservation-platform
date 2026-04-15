import json
from tenacity import retry, stop_after_attempt, wait_exponential
from typing import Dict, Any
from ..base_agent import BaseAgent

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def _run_with_retry(agent: BaseAgent, input_data: Any) -> Dict[str, Any]:
    return await agent.process(input_data)

async def execute_with_fallback(agent: BaseAgent, input_data: Any) -> Dict[str, Any]:
    try:
        return await _run_with_retry(agent, input_data)
    except Exception as e:
        print(f"Verification Agent {agent.name} failed after retries: {e}")
        return {
            "agent": agent.name, 
            "score": 50, 
            "flags": [], 
            "reasoning": f"Agent {agent.name} failed: {str(e)}"
        }

def safe_parse_json(content: str, default_agent_name: str) -> Dict[str, Any]:
    content = content.strip()
    if content.startswith("```json"):
        content = content[7:]
    elif content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    try:
        return json.loads(content.strip())
    except json.JSONDecodeError as e:
        print(f"JSON Parsing failed for {default_agent_name}: {e}\nRaw output: {content}")
        return {
            "agent": default_agent_name,
            "score": 50,
            "flags": [],
            "reasoning": "Failed to parse JSON output"
        }
