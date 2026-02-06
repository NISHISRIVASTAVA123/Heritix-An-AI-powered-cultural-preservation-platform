from .base_agent import BaseAgent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from config import settings

class EducationAgent(BaseAgent):
    def __init__(self):
        super().__init__("education")
        self.llm = ChatGroq(
            model="llama-70b-versatile", 
            temperature=0.7,
            api_key=settings.GROQ_API_KEY
        )

    async def process(self, input_data: str) -> Dict[str, Any]:
        prompt = ChatPromptTemplate.from_template(
            "Generate a short educational lesson plan and 3 quiz questions based on this cultural text: {text}"
        )
        chain = prompt | self.llm
        response = await chain.ainvoke({"text": input_data})
        return {"educational_content": response.content}
