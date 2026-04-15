from typing import Dict, Any
from .base_agent import BaseAgent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from config import settings

class ExtractionAgent(BaseAgent):
    """
    Knowledge mining agent configured to pull entity artifacts and metadata structures from freeform text.
    """
    def __init__(self) -> None:
        """Establish the ExtractionAgent with a deterministic configuration model."""
        super().__init__("extraction")
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0,
            api_key=settings.GROQ_API_KEY
        )

    async def process(self, input_data: str, **kwargs: Any) -> Dict[str, Any]:
        """
        Extract deterministic artifacts (ingredients, titles, themes) formatting logically into strict JSON output.

        Args:
            input_data (str): Evaluated blob corpus representing historical facts/observations.
            **kwargs (Any): Extensible variable configurations for base class.

        Returns:
            Dict[str, Any]: Mapped string-value structure housing extracted metadata entities.
        """
        prompt = ChatPromptTemplate.from_template(
            """
            Extract key cultural knowledge entities from the following text: {text}
            
            Return the output in STRICT JSON format with the following keys:
            - title (str): A concise, descriptive title for this piece of cultural knowledge (max 6 words).
            - knowledge_type (str): e.g., "folk_remedy", "ritual", "story", "other"
            - details (dict): Key details extracted (ingredients, steps, characters, etc.)
            - cultural_context (str): The cultural significance or context.
            - region_name (str): The specific region, state, or country mentioned. Defaults to "India" if unclear.
            - latitude (float): Estimated latitude coordinates for the region (e.g. 20.5937 for India).
            - longitude (float): Estimated longitude coordinates for the region (e.g. 78.9629 for India).
            
            Do not add any markdown formatting like ```json ... ```. Just the raw JSON string.
            """
        )
        chain = prompt | self.llm
        response = await chain.ainvoke({"text": input_data})
        
        import json
        try:
            # Clean up potential markdown code blocks
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            return json.loads(content.strip())
        except json.JSONDecodeError:
            return {"error": "Failed to parse JSON", "raw_output": response.content}

