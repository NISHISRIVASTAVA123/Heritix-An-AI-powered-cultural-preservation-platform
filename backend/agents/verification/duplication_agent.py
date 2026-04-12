from typing import Dict, Any
from ..base_agent import BaseAgent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from config import settings
from . import safe_parse_json
from db.mongo import db

class DuplicationAgent(BaseAgent):
    """
    Identifies semantic duplicates across the metadata knowledge base.

    Extracts core conversational entities as a fingerprint and compares them against 
    existing categorical MongoDB records, restricting redundancy inside the archives.
    """
    def __init__(self) -> None:
        """Initializes the deduplication structural check against LLaMA3."""
        super().__init__("duplication")
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0,
            api_key=settings.GROQ_API_KEY
        )

    async def process(self, input_data: Dict[str, Any], **kwargs: Any) -> Dict[str, Any]:
        """
        Execute semantic matching across previously approved database vectors.

        Args:
            input_data (Dict[str, Any]): Verification payload containing category, transcript, and IDs.
            kwargs (Any): Overflow generic execution params.

        Returns:
            Dict[str, Any]: Redundancy risk evaluation mapping duplicated records.
        """
        transcript = input_data.get("transcript", "")
        category = input_data.get("category", "")
        region = input_data.get("region", "")
        knowledge_id = input_data.get("knowledge_id", "")
        
        # 1. Generate semantic fingerprint
        fingerprint_prompt = ChatPromptTemplate.from_template(
            """
            Generate a compact semantic fingerprint for the following cultural knowledge transcript.
            Extract 3-5 key themes, entities, or concepts as a comma-separated string.
            
            Knowledge text:
            {transcript}
            
            Do not include any other text, just the comma-separated string.
            """
        )
        fingerprint_chain = fingerprint_prompt | self.llm
        fingerprint_res = await fingerprint_chain.ainvoke({"transcript": transcript})
        fingerprint = fingerprint_res.content.strip()

        # 2. Query MongoDB for records in same category 
        cursor = db.db.knowledge.find(
            {"category": category, "_id": {"$ne": knowledge_id}},
            {"_id": 1}
        )
        matching_docs = await cursor.to_list(length=100) # limit for safety
        
        if len(matching_docs) < 3:
            return {
                "agent": self.name,
                "score": 0.0,
                "flags": [],
                "reasoning": "Fewer than 3 existing records in same category/region. Skipping duplication check."
            }
            
        matching_ids = [doc["_id"] for doc in matching_docs]
        
        # Fetch their extraction_data
        content_cursor = db.db.knowledge_content.find(
            {"knowledge_id": {"$in": matching_ids}},
            {"knowledge_id": 1, "extraction_data": 1}
        )
        contents = await content_cursor.to_list(length=100)
        
        existing_summaries = []
        for c in contents:
            ed = c.get("extraction_data", {})
            if ed and isinstance(ed, dict):
                summary_text = f"ID: {c['knowledge_id']} - Title: {ed.get('title', '')} - Context: {ed.get('cultural_context', '')}"
                existing_summaries.append(summary_text)
                
        if not existing_summaries:
            return {
                "agent": self.name,
                "score": 0.0,
                "flags": [],
                "reasoning": "No valid existing extraction data found to compare."
            }

        existing_summaries_text = "\n".join(existing_summaries)
        
        # 3. Compare with fingerprint using LLM
        compare_prompt = ChatPromptTemplate.from_template(
            """
            Evaluate if the incoming cultural knowledge is a semantic near-duplicate of any existing archive entries.
            If any match exceeds 80% semantic similarity, flag it as a duplicate and include the matching knowledge_id.
            
            Incoming Fingerprint:
            {fingerprint}
            
            Incoming Transcript Extract:
            {transcript_snippet}
            
            Existing Records Summaries:
            {existing_summaries}
            
            Return the result in STRICT JSON format with the following keys:
            - score (float 0-100, where 0 = completely unique, 100 = exact duplicate)
            - flags (list of objects, each containing: {{"issue": "description", "segment": "the matching knowledge_id that it duplicates"}})
            - reasoning (str, explanation for the score and any matches)
            
            Do not include any other text except the JSON.
            """
        )
        compare_chain = compare_prompt | self.llm
        compare_res = await compare_chain.ainvoke({
            "fingerprint": fingerprint,
            "transcript_snippet": transcript[:500], # limit context
            "existing_summaries": existing_summaries_text[:4000] # limit context
        })
        
        result = safe_parse_json(compare_res.content, self.name)
        result["agent"] = self.name
        
        if "score" not in result:
            result["score"] = 0.0
            
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
