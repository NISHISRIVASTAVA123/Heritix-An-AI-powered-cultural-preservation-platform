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

    async def process(self, input_data: str, language: str = "en", **kwargs) -> Dict[str, Any]:
        prompt = ChatPromptTemplate.from_template(
            """
You are a cultural preservation educator working on **Heritix**, a platform dedicated to 
safeguarding living heritage — folk stories, ancestral remedies, oral histories, and 
time-honoured traditions passed down through generations.

You have been given a transcription of a cultural recording:

<cultural_text>
{text}
</cultural_text>

The original audio was spoken in the language with code: {language}

Your task is to generate rich, thoughtful educational content for GENERAL ADULT learners 
who are curious, reflective, and want to understand the deeper meaning behind cultural 
knowledge — not just its surface facts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION-BY-SECTION INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**SUMMARY** (5–7 sentences)
Write a narrative-style summary that:
- Sets the cultural and geographical context of this piece
- Describes the core subject (the story, the remedy, the tradition, the historical event)
- Mentions who traditionally held or transmitted this knowledge (elders, healers, storytellers)
- Conveys the emotional or community significance of this piece
- Explains why preserving it matters for future generations
Do NOT just list what was said. Paint a picture of the living tradition.

**LESSON** (6–9 sentences)
Extract the layered educational value:
- What practical knowledge or life skill does this tradition encode?
- What values (community, patience, respect for nature, intergenerational care, etc.) does it transmit?
- What is the historical or social context that gave rise to this practice or story?
- How does this connect to broader human experience across cultures?
- Include any relevant symbolism, metaphor, or cultural logic embedded in the content
- Where appropriate, note if modern science, psychology, or sociology corroborates the traditional wisdom

**MORAL** (4–5 sentences)
Go beyond a single proverb or tagline. Write a reflective moral that:
- States the core ethical or philosophical teaching
- Explains why generations found this worth preserving and passing on
- Connects it to a universal human truth or dilemma
- Offers the adult reader a personal reflection point: "What does this ask of me today?"

**QUIZ QUESTIONS** — Generate exactly 3 questions per language.
These are for thoughtful adult learners, so avoid simple yes/no or single-word answers.
Use this progression of depth:

  Q1 — CONTEXTUAL UNDERSTANDING
       Ask about the setting, origin, or cultural background of what was described.
       Answer should explain the context in 2–3 sentences.

  Q2 — COMPREHENSION & CAUSE
       Ask WHY something was done, believed, or passed down this way.
       Answer should explain the reasoning or cultural logic in 2–3 sentences.

  Q3 — SYMBOLIC OR DEEPER MEANING
       Ask what a particular element (an ingredient, a character, a ritual action) 
       represents or symbolises within this tradition.
       Answer should unpack the symbolism in 2–3 sentences.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return STRICT JSON only. No markdown, no backticks, no explanatory text before or after.
Provide all content in English ("en"), Hindi ("hi"), and the original native language ("native").
If the native language IS English or Hindi, still include it identically under the "native" key.

{{
  "summary": {{ "en": "...", "hi": "...", "native": "..." }},
  "lesson":  {{ "en": "...", "hi": "...", "native": "..." }},
  "moral":   {{ "en": "...", "hi": "...", "native": "..." }},
  "quiz_questions": {{
    "en": [
      {{"question": "...", "answer": "..."}},
      {{"question": "...", "answer": "..."}},
      {{"question": "...", "answer": "..."}}
    ],
    "hi": [
      {{"question": "...", "answer": "..."}},
      {{"question": "...", "answer": "..."}},
      {{"question": "...", "answer": "..."}}
    ],
    "native": [
      {{"question": "...", "answer": "..."}},
      {{"question": "...", "answer": "..."}},
      {{"question": "...", "answer": "..."}}
    ]
  }}
}}
"""
        )
        chain = prompt | self.llm
        response = await chain.ainvoke({"text": input_data, "language": language})
        
        import json
        import re
        try:
            content = response.content.strip()
            # Strip any markdown code fences (```json ... ``` or ``` ... ```)
            content = re.sub(r'^```(?:json)?\s*', '', content, flags=re.IGNORECASE)
            content = re.sub(r'\s*```$', '', content)
            content = content.strip()
            return json.loads(content)
        except json.JSONDecodeError:
            # Try to extract JSON object via regex as a fallback
            match = re.search(r'\{.*\}', response.content, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except json.JSONDecodeError:
                    pass
            print(f"[EducationAgent] JSON parse failed. Raw response: {response.content[:500]}")
            return {"educational_content": response.content, "error": "JSON parse failed"}

