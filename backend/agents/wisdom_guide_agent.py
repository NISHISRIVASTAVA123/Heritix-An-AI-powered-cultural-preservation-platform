from typing import Dict, Any
from .base_agent import BaseAgent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from config import settings
import json
import re

class WisdomGuideAgent(BaseAgent):
    """
    Agent that extracts practical folk medicine recipes or traditional agricultural guides from transcripts.
    """
    def __init__(self) -> None:
        super().__init__("wisdom_guide")
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0,
            api_key=settings.GROQ_API_KEY
        )

    async def process(self, input_data: str, **kwargs: Any) -> Dict[str, Any]:
        """
        Analyze text to extract a structured recipe or method.
        """
        prompt = ChatPromptTemplate.from_template(
            """
            You are an expert ethnobotanist and cultural archivist working on Heritix.
            Your task is to analyze the following transcript of traditional oral knowledge and determine if it contains a practical recipe, remedy, farming method, or traditional preparation guide (e.g. folk remedies, herbal teas, seed preservation, crop rotation mixtures).
            
            <transcript>
            {text}
            </transcript>
            
            Evaluate if there is actionable, step-by-step practical wisdom described in the text.
            If yes, set "has_guide" to true and extract the details. If it is only a general story, historical tale, or has no practical ingredients/steps, set "has_guide" to false.
            
            Return the output in STRICT JSON format with the following keys:
            - has_guide (bool): true if there is a practical remedy, recipe, farming method, or guide, false otherwise.
            - title (str or null): A descriptive, clear name of the remedy or method (max 6 words). E.g. "Ginger & Honey Cough Remedy", "Organic Neem Pest Repellent". Set to null if has_guide is false.
            - category (str or null): Either "Folk Medicine" or "Agriculture" or null if has_guide is false.
            - ingredients (list of str or null): List of raw materials, plants, herbs, spices, tools or ingredients needed. Set to null if has_guide is false.
            - steps (list of str or null): Clear, sequential, numbered instructions on how to prepare/conduct this remedy or method. Set to null if has_guide is false.
            - application (str or null): How, when, or how often to apply, consume, or use the recipe. E.g. "Consume warm twice a day after meals", "Spray on crop leaves in the evening". Set to null if has_guide is false.
            - warnings (str or null): Any safety precautions, contradictions, or dosage limits (e.g., "Do not give to pregnant women", "Consult doctor if fever persists"). Set to null if has_guide is false.
            
            Do not add any markdown formatting like ```json ... ```. Just the raw JSON string.
            """
        )
        chain = prompt | self.llm
        response = await chain.ainvoke({"text": input_data})
        
        try:
            content = response.content.strip()
            # Clean up potential markdown code blocks
            content = re.sub(r'^```(?:json)?\s*', '', content, flags=re.IGNORECASE)
            content = re.sub(r'\s*```$', '', content)
            return json.loads(content.strip())
        except json.JSONDecodeError:
            # Fallback regex extraction
            match = re.search(r'\{.*\}', response.content, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except json.JSONDecodeError:
                    pass
            print(f"[WisdomGuideAgent] JSON parse failed. Raw: {response.content}")
            return {"has_guide": False, "error": "JSON parse failed"}
