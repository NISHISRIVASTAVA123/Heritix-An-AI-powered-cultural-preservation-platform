from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseAgent(ABC):
    """
    Abstract base class for all language model agents in the pipeline.
    """
    def __init__(self, name: str) -> None:
        """
        Initialize the base agent.

        Args:
            name (str): The unique identifier for this agent.
        """
        self.name = name

    @abstractmethod
    async def process(self, input_data: Any, **kwargs: Any) -> Dict[str, Any]:
        """
        Process the input data and return the structured result.

        Args:
            input_data (Any): The primary input data (typically a string of text).
            **kwargs (Any): Additional specific parameters required by the concrete agent.

        Returns:
            Dict[str, Any]: Structured dictionary corresponding to the agent's specialized output format.
        """
        pass
