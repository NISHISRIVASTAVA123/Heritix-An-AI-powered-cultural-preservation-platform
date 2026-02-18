from typing import Dict, Any
from .base_agent import BaseAgent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from config import settings

class ExtractionAgent(BaseAgent):
    def __init__(self):
        super().__init__("extraction")
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0,
            api_key=settings.GROQ_API_KEY
        )

    async def process(self, input_data: str) -> Dict[str, Any]:
        prompt = ChatPromptTemplate.from_template(
            """
            Extract key cultural knowledge entities from the following text: {text}
            
            Return the output in STRICT JSON format with the following keys:
            - knowledge_type (str): e.g., "folk_remedy", "ritual", "story", "other"
            - details (dict): Key details extracted (ingredients, steps, characters, etc.)
            - cultural_context (str): The cultural significance or context.
            
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

