from typing import Dict, Any
from .base_agent import BaseAgent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from config import settings

class ContextAgent(BaseAgent):
    """
    Agent dedicated to deducing implicit cultural significance and psychological angles from a text.
    """
    def __init__(self) -> None:
        """Initialize the ContextAgent with a configured LLM."""
        super().__init__("context")
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0,
            api_key=settings.GROQ_API_KEY
        )

    async def process(self, input_data: str, **kwargs: Any) -> Dict[str, Any]:
        """
        Produce a short analysis on the cultural and historical implications of the material.

        Args:
            input_data (str): Descriptive narrative blob text.
            **kwargs (Any): Variable keyword arguments (unused in this agent).

        Returns:
            Dict[str, Any]: Encapsulated string analysis under the 'context_analysis' key.
        """
        prompt = ChatPromptTemplate.from_template(
            "Analyze the cultural context and significance of the following text: {text}"
        )
        chain = prompt | self.llm
        response = await chain.ainvoke({"text": input_data})
        return {"context_analysis": response.content}
