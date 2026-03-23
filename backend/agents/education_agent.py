from typing import Dict, Any
from .base_agent import BaseAgent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from config import settings

class EducationAgent(BaseAgent):
    def __init__(self):
        super().__init__("education")
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile", 
            temperature=0.7,
            api_key=settings.GROQ_API_KEY
        )

<<<<<<< HEAD
    async def process(self, input_data: str) -> Dict[str, Any]:
        prompt = ChatPromptTemplate.from_template(
            """
            Generate educational content based on this cultural text: {text}
            
            Return the output in STRICT JSON format with the following keys:
            - summary (str): A simplified summary.
            - lesson (str): A short lesson derived from the text.
            - moral (str): The moral or key takeaway.
            - quiz_questions (list): 3 simple questions with answers.
            
            Do not add any markdown formatting.
            """
        )
        chain = prompt | self.llm
        response = await chain.ainvoke({"text": input_data})
=======
    async def process(self, input_data: str, language: str = "en", **kwargs) -> Dict[str, Any]:
        prompt = ChatPromptTemplate.from_template(
            """
            Generate educational content based on this cultural text: {text}
            The original audio was spoken in the language code: {language}.
            
            Return the output in STRICT JSON format. Do not add any markdown formatting.
            For each of the following sections, provide the text in English ("en"), Hindi ("hi"), and the original native language ("native").
            (If the native language is English or Hindi, still provide it under the "native" key, identical to that language).
            
            The JSON MUST have the following structure exactly:
            {{
              "summary": {{ "en": "...", "hi": "...", "native": "..." }},
              "lesson": {{ "en": "...", "hi": "...", "native": "..." }},
              "moral": {{ "en": "...", "hi": "...", "native": "..." }},
              "quiz_questions": {{
                 "en": [ {{"question": "...", "answer": "..."}} ],
                 "hi": [ {{"question": "...", "answer": "..."}} ],
                 "native": [ {{"question": "...", "answer": "..."}} ]
              }}
            }}
            """
        )
        chain = prompt | self.llm
        response = await chain.ainvoke({"text": input_data, "language": language})
>>>>>>> nishi_20
        
        import json
        try:
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            return json.loads(content.strip())
        except:
            return {"educational_content": response.content, "error": "JSON parse failed"}

