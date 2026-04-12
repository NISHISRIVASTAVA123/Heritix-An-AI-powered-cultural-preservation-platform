from typing import Dict, Any
from ..base_agent import BaseAgent
from db.mongo import db
from datetime import datetime

class DecisionRouterAgent(BaseAgent):
    def __init__(self):
        super().__init__("decision_router")

    async def _log_stage(self, knowledge_id: str, stage: str, status: str, error: str = None):
        log_entry = {
            "knowledge_id": knowledge_id,
            "stage": stage,
            "status": status,
            "error_message": error,
            "timestamp": datetime.utcnow()
        }
        await db.db.processing_logs.insert_one(log_entry)

    async def process(self, input_data: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        knowledge_id = input_data.get("knowledge_id")
        risk_level = input_data.get("risk_level")
        disclaimer = input_data.get("disclaimer")
        
        # We construct the full result to store in verification_flags
        verification_flag_entry = {
            "knowledge_id": knowledge_id,
            "risk_level": risk_level,
            "composite_score": input_data.get("composite_score", 0.0),
            "agent_scores": input_data.get("agent_scores", {}),
            "flags": input_data.get("all_flags", []),
            "disclaimer": disclaimer,
            "veto_triggered": input_data.get("veto_triggered", False),
            "created_at": datetime.utcnow()
        }
        
        # Write to verification_flags
        await db.db.verification_flags.insert_one(verification_flag_entry)
        
        if risk_level == "high":
            await db.db.knowledge.update_one(
                {"_id": knowledge_id},
                {"$set": {
                    "verification_status": "quarantined",
                    "processing_status": "quarantined",
                    "updated_at": datetime.utcnow()
                }}
            )
            await self._log_stage(knowledge_id, "verification_quarantined", "completed")
            return {
                "action": "quarantine",
                "continue_pipeline": False,
                "disclaimer": None
            }
            
        elif risk_level == "medium":
            await db.db.knowledge.update_one(
                {"_id": knowledge_id},
                {"$set": {
                    "verification_status": "flagged",
                    "disclaimer": disclaimer,
                    "updated_at": datetime.utcnow()
                }}
            )
            await self._log_stage(knowledge_id, "verification_flagged", "completed")
            return {
                "action": "flag",
                "continue_pipeline": True,
                "disclaimer": disclaimer
            }
            
        else: # low
            await db.db.knowledge.update_one(
                {"_id": knowledge_id},
                {"$set": {
                    "verification_status": "verified",
                    "updated_at": datetime.utcnow()
                }}
            )
            await self._log_stage(knowledge_id, "verification_complete", "completed")
            return {
                "action": "approve",
                "continue_pipeline": True,
                "disclaimer": None
            }
