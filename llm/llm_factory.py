from typing import Type
from .llm_interface import LLMInterface
from .openai_llm import OpenAILLM
from .openai_compatible_llm import OpenAICompatibleLLM
from .claude_llm import ClaudeLLM
from .gemini_llm import GeminiLLM


class LLMFactory:
    """
    Factory class for creating LLM instances.
    Supports OpenAI, Claude, Gemini, and OpenAI-compatible providers.
    """
    
    SUPPORTED_PROVIDERS = ["openai", "openai_compatible", "claude", "gemini"]
    
    @staticmethod
    def create_llm(llm_provider: str, **kwargs) -> Type[LLMInterface]:
        """
        Create an LLM instance based on the provider.
        
        Args:
            llm_provider: The LLM provider ("openai", "openai_compatible", "claude", or "gemini")
            **kwargs: Configuration parameters for the LLM
            
        Returns:
            LLM instance implementing LLMInterface
            
        Raises:
            ValueError: If the provider is not supported
        """
        
        llm_provider = llm_provider.lower()
        
        if llm_provider == "openai":
            return OpenAILLM(
                model=kwargs.get("model", "gpt-4o"),
                api_key=kwargs.get("api_key"),
                system_prompt=kwargs.get("system_prompt", ""),
                temperature=kwargs.get("temperature", 0.7),
                max_tokens=kwargs.get("max_tokens", 1000)
            )
        elif llm_provider == "openai_compatible":
            return OpenAICompatibleLLM(
                model=kwargs.get("model"),
                api_key=kwargs.get("api_key"),
                base_url=kwargs.get("base_url"),
                system_prompt=kwargs.get("system_prompt", ""),
                temperature=kwargs.get("temperature", 0.7),
                max_tokens=kwargs.get("max_tokens", 1000)
            )
        elif llm_provider == "claude":
            return ClaudeLLM(
                model=kwargs.get("model", "claude-3-5-haiku-latest"),
                api_key=kwargs.get("api_key"),
                system_prompt=kwargs.get("system_prompt", ""),
                temperature=kwargs.get("temperature", 0.7),
                max_tokens=kwargs.get("max_tokens", 1000)
            )
        elif llm_provider == "gemini":
            return GeminiLLM(
                model=kwargs.get("model", "gemini-1.5-flash"),
                api_key=kwargs.get("api_key"),
                system_prompt=kwargs.get("system_prompt", ""),
                temperature=kwargs.get("temperature", 0.7),
                max_tokens=kwargs.get("max_tokens", 1000)
            )
        else:
            raise ValueError(
                f"Unsupported LLM provider: {llm_provider}. "
                f"Supported providers: {', '.join(LLMFactory.SUPPORTED_PROVIDERS)}"
            )
    
    @staticmethod
    def get_supported_providers() -> list:
        """Get list of supported LLM providers."""
        return LLMFactory.SUPPORTED_PROVIDERS.copy()
    
    @staticmethod
    def get_supported_models(provider: str) -> list:
        """Get list of supported models for a provider."""
        provider = provider.lower()
        
        if provider == "openai":
            return ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano", "gpt-4", "gpt-3.5-turbo"]
        elif provider == "openai_compatible":
            return ["custom-model"]  # Placeholder, users can specify any model name
        elif provider == "claude":
            return [
                "claude-opus-4-0",
                "claude-sonnet-4-0", 
                "claude-3-7-sonnet-latest",
                "claude-3-5-sonnet-latest",
                "claude-3-5-haiku-latest",
                "claude-3-opus-latest"
            ]
        elif provider == "gemini":
            return [
                "gemini-1.5-pro", 
                "gemini-1.5-flash", 
                "gemini-1.0-pro",
                "gemini-pro",
                "gemini-pro-vision"
            ]
        else:
            raise ValueError(f"Unsupported provider: {provider}")


# 使用示例:
# OpenAI
# llm = LLMFactory.create_llm("openai", model="gpt-4o", api_key="your-key")
#
# OpenAI Compatible (e.g., local models, other OpenAI-compatible APIs)
# llm = LLMFactory.create_llm(
#     "openai_compatible", 
#     model="llama-3-8b",
#     base_url="http://localhost:8000/v1",
#     api_key="optional-key"
# )
#
# Claude
# llm = LLMFactory.create_llm("claude", model="claude-3-5-sonnet-latest", api_key="your-key")
#
# Gemini
# llm = LLMFactory.create_llm("gemini", model="gemini-1.5-pro", api_key="your-key")
