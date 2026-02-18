from typing import Dict, Any
from .base_agent import BaseAgent
from .extraction_agent import ExtractionAgent
from .categorization_agent import CategorizationAgent
from .context_agent import ContextAgent
from .education_agent import EducationAgent
from .translation_agent import TranslationAgent
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

# Helper for Retry Logic
# Retries 3 times, waiting 2s, 4s, 8s...
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def execute_agent_scan(agent: BaseAgent, text: str) -> Dict[str, Any]:
    """Execute an agent's process method with retry logic"""
    try:
        return await agent.process(text)
    except Exception as e:
        print(f"Agent {agent.name} failed (attempting retry): {e}")
        raise e

class AgentManager:
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.register_agent(ExtractionAgent())
        self.register_agent(CategorizationAgent())
        self.register_agent(ContextAgent())
        self.register_agent(EducationAgent())
        self.register_agent(TranslationAgent())

    def register_agent(self, agent: BaseAgent):
        self.agents[agent.name] = agent

    async def process_extraction(self, text: str) -> Dict[str, Any]:
        if "extraction" in self.agents:
            return await execute_agent_scan(self.agents["extraction"], text)
        return {}

    async def process_categorization(self, text: str) -> Dict[str, Any]:
        if "categorization" in self.agents:
            return await execute_agent_scan(self.agents["categorization"], text)
        return {}
        
    async def process_context(self, text: str) -> Dict[str, Any]:
        if "context" in self.agents:
            return await execute_agent_scan(self.agents["context"], text)
        return {}

    async def process_education(self, text: str) -> Dict[str, Any]:
        if "education" in self.agents:
            return await execute_agent_scan(self.agents["education"], text)
        return {}

    async def process_translation(self, text: str) -> Dict[str, str]:
        if "translation" in self.agents:
            return await execute_agent_scan(self.agents["translation"], text)
        return {}

    async def run_pipeline(self, text: str) -> Dict[str, Any]:
        """
        Run the full cultural preservation pipeline
        1. Extraction
        2. Categorization
        3. Context
        4. Education
        5. Translation
        """
        results = {"original_text": text}
        
        results["extraction"] = await self.process_extraction(text)
        results["categorization"] = await self.process_categorization(text)
        results["context"] = await self.process_context(text)
        results["education"] = await self.process_education(text)
        results["translation"] = await self.process_translation(text)
        
        return results
