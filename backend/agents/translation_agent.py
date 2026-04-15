from typing import Dict, Any
from .base_agent import BaseAgent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from config import settings

class TranslationAgent(BaseAgent):
    """
    Multilingual globalization agent executing robust string mappings and corpus transformations.
    """
    def __init__(self) -> None:
        """Initialize the TranslationAgent focusing on maximized token spaces to manage whole transcriptions."""
        super().__init__("translation")
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=8192,
            api_key=settings.GROQ_API_KEY
        )

    async def process(self, input_data: str, **kwargs: Any) -> Dict[str, Any]:
        """
        Migrates any native string context linearly towards standardized English structural formatting.

        Args:
            input_data (str): Unknown cultural language string corpus.
            **kwargs (Any): Extensible variable parameters for general base compatibility.

        Returns:
            Dict[str, Any]: English mapped dictionary returning the comprehensive corpus.
        """
        prompt = ChatPromptTemplate.from_template(
            """
            Translate the following text into English completely and in full.
            If the text is already in English, return it exactly as is.
            Do NOT truncate, summarize, or omit any part of the text.
            Translate every single sentence from start to finish.

            Text: {text}

            Return the output in STRICT JSON format with the following key:
            - en (str): The complete, full English translation without any truncation.

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
            return {"en": "Translation failed", "error": "JSON parse error", "raw": response.content}
