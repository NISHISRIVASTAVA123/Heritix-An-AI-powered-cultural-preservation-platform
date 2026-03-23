from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseAgent(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
<<<<<<< HEAD
    async def process(self, input_data: Any) -> Dict[str, Any]:
=======
    async def process(self, input_data: Any, **kwargs) -> Dict[str, Any]:
>>>>>>> nishi_20
        """
        Process the input data and return result
        """
        pass
