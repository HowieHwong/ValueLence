from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class LLMInterface(ABC):
    """
    Abstract base class for LLM implementations.
    """
    
    def __init__(self, model: str = None, api_key: str = None, **kwargs):
        self.model = model
        self.api_key = api_key
        self.system_prompt = kwargs.get('system_prompt', '')
        self.temperature = kwargs.get('temperature', 0.7)
        self.max_tokens = kwargs.get('max_tokens', 8192)
        
    @abstractmethod
    def generate(self, prompt: str, **kwargs) -> str:
        """
        Generate a response for the given prompt.
        
        Args:
            prompt: The input prompt
            **kwargs: Additional parameters for generation
            
        Returns:
            Generated response as string
        """
        pass
    
    @abstractmethod
    def chat(self, messages: list, **kwargs) -> str:
        """
        Generate a response for chat messages.
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            **kwargs: Additional parameters for generation
            
        Returns:
            Generated response as string
        """
        pass
