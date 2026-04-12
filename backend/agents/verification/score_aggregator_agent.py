from typing import Dict, Any, List
from ..base_agent import BaseAgent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from config import settings

class ScoreAggregatorAgent(BaseAgent):
    """
    Computes a weighted composite severity score based on discrete agent outputs.

    Aggregates metrics spanning safety, authenticity, sensitivity, completeness, 
    and duplication. Generates intelligent disclaimers for medium thresholds and 
    implements unilateral veto rules against extreme danger risks.
    """
    def __init__(self) -> None:
        """Initializes the accumulator logic allocating weighted priority structures."""
        super().__init__("score_aggregator")
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0,
            api_key=settings.GROQ_API_KEY
        )
        self.weights = {
            "safety": 0.35,
            "authenticity": 0.25,
            "sensitivity": 0.20,
            "completeness": 0.12,
            "duplication": 0.08
        }

    async def process(self, input_data: Dict[str, Any], **kwargs: Any) -> Dict[str, Any]:
        """
        Evaluate distinct agent scores establishing the comprehensive pipeline index.

        Args:
            input_data (Dict[str, Any]): Bundled agent scores parsed from previous verification steps.
            kwargs (Any): Overflow generic execution params.

        Returns:
            Dict[str, Any]: Re-mapped aggregation holding the risk_level and total composite indices.
        """
        agent_results: List[Dict[str, Any]] = input_data.get("agent_results", [])
        
        # 1. Extract scores and merge flags
        agent_scores = {
            "safety": 0.0,
            "authenticity": 0.0,
            "sensitivity": 0.0,
            "completeness": 0.0,
            "duplication": 0.0
        }
        all_flags = []
        
        for res in agent_results:
            agent_name = res.get("agent", "")
            if agent_name in agent_scores:
                agent_scores[agent_name] = float(res.get("score", 50.0))
            all_flags.extend(res.get("flags", []))
            
        # 2. Compute composite score
        composite_score = sum(agent_scores[k] * self.weights[k] for k in agent_scores)
        
        # 3. Apply Thresholds & Veto Rule
        veto_triggered = False
        if agent_scores["safety"] > 85.0:
            risk_level = "high"
            veto_triggered = True
        else:
            if composite_score <= 35.0:
                risk_level = "low"
            elif composite_score <= 65.0:
                risk_level = "medium"
            else:
                risk_level = "high"
                
        # 4. Generate disclaimer for medium risk
        disclaimer = None
        if risk_level == "medium" and not veto_triggered:
            # Generate disclaimer based on flags
            flag_issues = [f['issue'] for f in all_flags]
            issues_str = "; ".join(flag_issues) if flag_issues else "General potential inaccuracies"
            
            disclaimer_prompt = ChatPromptTemplate.from_template(
                """
                Write a 2-sentence plain-English disclaimer for a cultural knowledge entry.
                The entry has been flagged for medium risk due to these specific concerns: {issues}
                
                Make it professional, objective, and clearly state to consult experts if needed.
                Do not include quotes around the disclaimer. Just return the 2 sentences.
                """
            )
            disclaimer_chain = disclaimer_prompt | self.llm
            res = await disclaimer_chain.ainvoke({"issues": issues_str})
            disclaimer = res.content.strip()
            # Clean up quotes if LLM added them
            if disclaimer.startswith('"') and disclaimer.endswith('"'):
                disclaimer = disclaimer[1:-1]
                
        return {
            "risk_level": risk_level,
            "composite_score": round(composite_score, 2),
            "agent_scores": agent_scores,
            "all_flags": all_flags,
            "disclaimer": disclaimer,
            "veto_triggered": veto_triggered
        }
