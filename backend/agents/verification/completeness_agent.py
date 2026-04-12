from typing import Dict, Any
from ..base_agent import BaseAgent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from config import settings
from . import safe_parse_json

class CompletenessAgent(BaseAgent):
    def __init__(self):
        super().__init__("completeness")
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0,
            api_key=settings.GROQ_API_KEY
        )

    async def process(self, input_data: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        prompt = ChatPromptTemplate.from_template(
            """
            Evaluate whether the knowledge entry is actionable and coherent on its own, or a fragment that would mislead without more context.
            
            Instructions:
            - Check if a remedy includes ingredients but no preparation steps.
            - Check if a ritual is described without its occasion or purpose.
            - Check if a story has no resolution or moral.
            - Check if instructions reference undefined external elements.
            - If category is "story" or "folklore", apply looser rules (oral stories can be open-ended).
            
            Knowledge text:
            {transcript}
            
            Category:
            {category}
            
            Context Analysis:
            {context_analysis}
            
            Return the result in STRICT JSON format with the following keys:
            - score (float 0-100, where 0 = fully complete and coherent, 100 = severely incomplete or fragmented)
            - missing_elements (list of str, what is explicitly missing)
            - flags (list of objects, each containing: {{"issue": "description", "segment": "excerpt that triggered it"}})
            - reasoning (str, explanation for the score)
            
            Do not include any other text except the JSON.
            """
        )
        chain = prompt | self.llm
        response = await chain.ainvoke({
            "transcript": input_data.get("transcript", ""),
            "category": input_data.get("category", ""),
            "context_analysis": str(input_data.get("context_analysis", ""))
        })
        
        result = safe_parse_json(response.content, self.name)
        result["agent"] = self.name
        
        if "score" not in result:
            result["score"] = 50
        if "missing_elements" not in result:
            result["missing_elements"] = []
            
        standardized_flags = []
        for flag in result.get("flags", []):
            if isinstance(flag, dict):
                standardized_flags.append({
                    "agent": self.name,
                    "issue": flag.get("issue", "Unspecified issue"),
                    "segment": flag.get("segment", "")
                })
        result["flags"] = standardized_flags
        
        return result
