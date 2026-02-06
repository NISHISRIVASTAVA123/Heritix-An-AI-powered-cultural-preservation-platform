from .extraction_agent import ExtractionAgent
from .categorization_agent import CategorizationAgent
from .context_agent import ContextAgent
from .education_agent import EducationAgent

class AgentManager:
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.register_agent(ExtractionAgent())
        self.register_agent(CategorizationAgent())
        self.register_agent(ContextAgent())
        self.register_agent(EducationAgent())

    def register_agent(self, agent: BaseAgent):
        self.agents[agent.name] = agent

    async def run_pipeline(self, text: str) -> Dict[str, Any]:
        """
        Run the full cultural preservation pipeline
        1. Extraction
        2. Categorization
        3. Context
        4. Education
        """
        results = {"original_text": text}
        
        # Placeholder for pipeline execution
        if "extraction" in self.agents:
            results["extraction"] = await self.agents["extraction"].process(text)
        if "categorization" in self.agents:
            results["categorization"] = await self.agents["categorization"].process(text)
        if "context" in self.agents:
            results["context"] = await self.agents["context"].process(text)
        if "education" in self.agents:
            results["education"] = await self.agents["education"].process(text)
        
        return results
