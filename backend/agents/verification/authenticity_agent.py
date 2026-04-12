from typing import Dict, Any
from ..base_agent import BaseAgent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from config import settings
from . import safe_parse_json

class AuthenticityAgent(BaseAgent):
    def __init__(self):
        super().__init__("authenticity")
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0,
            api_key=settings.GROQ_API_KEY
        )

    async def process(self, input_data: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        prompt = ChatPromptTemplate.from_template(
            """
            Evaluate whether the following cultural knowledge is genuine oral tradition vs fabricated, anachronistic, or internally inconsistent.
            
            Instructions:
            - Check for anachronisms (e.g. modern references in supposedly ancient practices)
            - Assess internal logical consistency of the knowledge
            - Evaluate plausibility given the stated region and category
            - Detect overly generic content that lacks cultural specificity
            
            Knowledge text:
            {transcript}
            
            Category:
            {category}
            
            Context Analysis:
            {context_analysis}
            
            Region:
            {region}
            
            Return the result in STRICT JSON format with the following keys:
            - score (float 0-100, where 0 = clearly inauthentic/fabricated, 100 = highly authentic)
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
        
        raw_authenticity = float(result.get("score", 50))
        
        # INVERT score: authenticity_risk = 100 - authenticity_score
        result["raw_authenticity"] = raw_authenticity
        result["score"] = 100.0 - raw_authenticity
        
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
