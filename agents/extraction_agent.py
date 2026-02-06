from .base_agent import BaseAgent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from config import settings

class ExtractionAgent(BaseAgent):
    def __init__(self):
        super().__init__("extraction")
        self.llm = ChatGroq(
            model="llama-70b-versatile",
            temperature=0,
            api_key=settings.GROQ_API_KEY
        )

    async def process(self, input_data: str) -> Dict[str, Any]:
        prompt = ChatPromptTemplate.from_template(
            "Extract key cultural knowledge entities from the following text: {text}"
        )
        chain = prompt | self.llm
        response = await chain.ainvoke({"text": input_data})
        return {"entities": response.content}
