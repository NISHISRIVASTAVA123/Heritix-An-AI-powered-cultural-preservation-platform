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
async def execute_agent_scan(agent: BaseAgent, text: str, **kwargs) -> Dict[str, Any]:
    """Execute an agent's process method with retry logic"""
    try:
        return await agent.process(text, **kwargs)
    except Exception as e:
        print(f"Agent {agent.name} failed (attempting retry): {e}")
        raise e

class AgentManager:
    """
    Orchestrates specialized language model agents throughout the AI pipeline.
    
    Acts as a central registry controlling parallel execution, fallback mechanisms, 
    and task offloading exclusively mapped via string handler names.
    """
    
    def __init__(self) -> None:
        """Initialize the AgentManager and sequentially map available pipeline agents."""
        self.agents: Dict[str, BaseAgent] = {}
        self.register_agent(ExtractionAgent())
        self.register_agent(CategorizationAgent())
        self.register_agent(ContextAgent())
        self.register_agent(EducationAgent())
        self.register_agent(TranslationAgent())

    def register_agent(self, agent: BaseAgent) -> None:
        """
        Bind a concrete AI operation node mapping to the manager registry.

        Args:
            agent (BaseAgent): Evaluated node conforming to standardized class contracts.
        """
        self.agents[agent.name] = agent

    async def process_extraction(self, text: str) -> Dict[str, Any]:
        """
        Execute temporal, situational, and event data isolation.

        Args:
            text (str): Validated transcription corpus.

        Returns:
            Dict[str, Any]: Structured dictionary evaluating explicit situational events.
        """
        if "extraction" in self.agents:
            return await execute_agent_scan(self.agents["extraction"], text)
        return {}

    async def process_categorization(self, text: str) -> Dict[str, Any]:
        """
        Distribute raw textual context across overarching systematic taxonomy.

        Args:
            text (str): Descriptive narrative blob text.

        Returns:
            Dict[str, Any]: Explicit taxonomic classification and theme data.
        """
        if "categorization" in self.agents:
            return await execute_agent_scan(self.agents["categorization"], text)
        return {}
        
    async def process_context(self, text: str) -> Dict[str, Any]:
        """
        Formulate anthropological and psychological insight perspectives locally implied.

        Args:
            text (str): Evaluated string context.

        Returns:
            Dict[str, Any]: Explicit insight evaluation payload.
        """
        if "context" in self.agents:
            return await execute_agent_scan(self.agents["context"], text)
        return {}

    async def process_education(self, text: str, language: str = "en") -> Dict[str, Any]:
        """
        Reconstruct original metadata logically structured for pedagogical transmission.

        Args:
            text (str): Target text transcript.
            language (str): Destination instructional language code translation base.

        Returns:
            Dict[str, Any]: Formatted pedagogical dictionary mapped explicitly.
        """
        if "education" in self.agents:
            return await execute_agent_scan(self.agents["education"], text, language=language)
        return {}

    async def process_translation(self, text: str) -> Dict[str, str]:
        """
        Multilingual globalization process propagating language alternatives natively.

        Args:
            text (str): Evaluated origin string text corpus.

        Returns:
            Dict[str, str]: Mapped language string translations natively.
        """
        if "translation" in self.agents:
            return await execute_agent_scan(self.agents["translation"], text)
        return {}

    async def run_pipeline(self, text: str) -> Dict[str, Any]:
        """
        Run the full cultural preservation pipeline synchronously.
        
        Evaluated Steps:
        1. Extraction
        2. Categorization
        3. Context
        4. Education
        5. Translation

        Args:
            text (str): Full original narrative structure.

        Returns:
            Dict[str, Any]: Re-mapped aggregation holding entirely tracked variables.
        """
        results = {"original_text": text}
        
        results["extraction"] = await self.process_extraction(text)
        results["categorization"] = await self.process_categorization(text)
        results["context"] = await self.process_context(text)
        results["education"] = await self.process_education(text)
        results["translation"] = await self.process_translation(text)
        
        return results
