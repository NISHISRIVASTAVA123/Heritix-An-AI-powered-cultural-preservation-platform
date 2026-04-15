from typing import Dict, Any
from ..base_agent import BaseAgent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from config import settings
from . import safe_parse_json

class SensitivityAgent(BaseAgent):
    def __init__(self):
        super().__init__("sensitivity")
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0,
            api_key=settings.GROQ_API_KEY
        )

    async def process(self, input_data: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        prompt = ChatPromptTemplate.from_template(
            """
            Identify culturally restricted, sacred, or community-specific content that should not be publicly accessible.
            
            Instructions:
            - Detect language indicating restricted access: "only elders", "secret ritual", "not for outsiders", "initiation only", "women/men only", etc.
            - Identify topic categories that are typically sacred: burial rites, initiation ceremonies, shamanic practices, ancestor communication, gender-restricted ceremonies.
            - Assign an access_level recommendation: "public" | "community_only" | "restricted"
            
            Knowledge text:
            {transcript}
            
            Category:
            {category}
            
            Context Analysis:
            {context_analysis}
            
            Region:
            {region}
            
            Return the result in STRICT JSON format with the following keys:
            - score (float 0-100, where 0 = fully public, 100 = must be strictly restricted)
            - access_level (str : "public" | "community_only" | "restricted")
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
        
        if "score" not in result:
            result["score"] = 50
        if "access_level" not in result:
            result["access_level"] = "restricted" if float(result["score"]) > 65 else "community_only" if float(result["score"]) > 35 else "public"
            
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
