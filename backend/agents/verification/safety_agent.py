from typing import Dict, Any
from ..base_agent import BaseAgent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from config import settings
from . import safe_parse_json

class SafetyAgent(BaseAgent):
    def __init__(self):
        super().__init__("safety")
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0,
            api_key=settings.GROQ_API_KEY
        )

    async def process(self, input_data: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        prompt = ChatPromptTemplate.from_template(
            """
            Analyze the following cultural knowledge for physical safety risks.
            You must detect knowledge that could cause physical harm if followed without supervision or medical context.
            
            Instructions:
            - Identify imperative instructions that could cause harm (e.g. ingest X, apply directly to wound, burn Y)
            - Check for unverified medical/herbal dosage claims
            - Flag content appropriate only under expert supervision
            - Be especially strict when category is "medicine" or "remedy"
            
            Knowledge text:
            {transcript}
            
            Category:
            {category}
            
            Context Analysis:
            {context_analysis}
            
            Region:
            {region}
            
            Return the result in STRICT JSON format with the following keys:
            - score (float 0-100 where 100 is highly dangerous and 0 is completely safe)
            - flags (list of objects, each containing: {{"issue": "description", "segment": "excerpt that triggered it"}})
            - reasoning (str, explanation for the score)
            
            Do not include any other text except the JSON.
            """
        )
        chain = prompt | self.llm
        response = await chain.ainvoke({
            "transcript": input_data.get("transcript", ""),
            "category": input_data.get("category", ""),
            "context_analysis": str(input_data.get("context_analysis", "")),
            "region": input_data.get("region", "")
        })
        
        result = safe_parse_json(response.content, self.name)
        result["agent"] = self.name
        
        # In case the prompt didn't correctly format it, enforce fallback handling
        if "score" not in result:
            result["score"] = 50
        if "flags" not in result:
            result["flags"] = []
            
        # Standardize flags format
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
