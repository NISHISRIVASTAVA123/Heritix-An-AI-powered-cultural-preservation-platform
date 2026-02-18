from typing import Dict, Any
from .base_agent import BaseAgent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from config import settings

class CategorizationAgent(BaseAgent):
    def __init__(self):
        super().__init__("categorization")
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile", 
            temperature=0,
            api_key=settings.GROQ_API_KEY
        )

    async def process(self, input_data: str) -> Dict[str, Any]:
        prompt = ChatPromptTemplate.from_template(
            """
            Categorize the following text into a cultural domain.
            Text: {text}
            
            Choose ONE from: "Folk Medicine", "Agriculture", "Folklore & Stories", "Cultural Rituals", "Life Advice & Ethics".
            
            Return the output in STRICT JSON format with the following key:
            - category (str)
            
            Do not add any markdown formatting.
            """
        )
        chain = prompt | self.llm
        response = await chain.ainvoke({"text": input_data})
        
        import json
        try:
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            return json.loads(content.strip())
        except:
             return {"category": "Uncategorized", "raw": response.content}

