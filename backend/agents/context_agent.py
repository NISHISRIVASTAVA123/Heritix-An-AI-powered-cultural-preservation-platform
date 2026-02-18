from typing import Dict, Any
from .base_agent import BaseAgent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from config import settings

class ContextAgent(BaseAgent):
    def __init__(self):
        super().__init__("context")
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0,
            api_key=settings.GROQ_API_KEY
        )

    async def process(self, input_data: str) -> Dict[str, Any]:
        prompt = ChatPromptTemplate.from_template(
            "Analyze the cultural context and significance of the following text: {text}"
        )
        chain = prompt | self.llm
        response = await chain.ainvoke({"text": input_data})
        return {"context_analysis": response.content}
