import yaml
import os
import sys
from typing import Dict, Any, List
import traceback

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from llm.llm_factory import LLMFactory


class LLMTester:
    """Test class for all supported LLM providers."""
    
    def __init__(self, config_path: str = "conf.yaml"):
        """Initialize tester with configuration."""
        self.config = self.load_config(config_path)
        self.test_results = {}
        
    def load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration from YAML file."""
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            print(f"Configuration file {config_path} not found!")
            return {}
        except yaml.YAMLError as e:
            print(f"Error parsing YAML configuration: {e}")
            return {}
    
    def test_provider_model(self, provider_name: str, model: str, config: Dict[str, Any]) -> bool:
        """Test a specific model for a provider."""
        provider_type = config.get('provider_type', 'unknown')
        
        print(f"\n{'='*60}")
        print(f"Testing {provider_name.upper()} - {model} ({provider_type})")
        print(f"{'='*60}")
        
        try:
            # Prepare kwargs for LLM creation
            llm_kwargs = {k: v for k, v in config.items() if k not in ['provider_type', 'enabled', 'models']}
            # Set the specific model
            llm_kwargs['model'] = model
            
            # Create LLM instance
            print(f"🔧 Creating {provider_type} LLM instance for {model}...")
            llm = LLMFactory.create_llm(provider_type, **llm_kwargs)
            print(f"✅ {provider_name} - {model} LLM instance created successfully")
            
            # Test basic generation
            print(f"🧪 Testing basic generation...")
            test_prompt = self.config.get('test_settings', {}).get('test_prompt', 
                                        "What is artificial intelligence? Explain in one sentence.")
            response = llm.generate(test_prompt, max_tokens=8192)
            print(f"📝 Response: {response[:150]}...")
            
            # Test chat functionality
            print(f"🗨️  Testing chat functionality...")
            chat_config = self.config.get('test_settings', {}).get('chat_test', {})
            messages = [
                {"role": "system", "content": chat_config.get('system_message', 'You are a helpful assistant.')},
                {"role": "user", "content": chat_config.get('user_message', 'Hello! How are you?')}
            ]
            chat_response = llm.chat(messages, max_tokens=8192)
            print(f"💬 Chat response: {chat_response[:150]}...")
            
            # Test probe generation
            print(f"🎯 Testing probe generation...")
            probe_config = self.config.get('test_settings', {}).get('probe_test', {})
            test_values = probe_config.get('test_values', ['fairness', 'honesty'])[:2]  # Limit to 2 for testing
            num_probes = probe_config.get('num_probes', 2)
            
            probes = llm.generate_probes(test_values, num_probes=num_probes)
            print(f"🔍 Generated probes:")
            for value, probe_list in probes.items():
                print(f"  {value}: {len(probe_list)} probes")
                for i, probe in enumerate(probe_list[:1], 1):  # Show first probe only
                    print(f"    {i}. {probe[:100]}...")
            
            print(f"✅ All tests passed for {provider_name} - {model}!")
            return True
            
        except Exception as e:
            print(f"❌ Error testing {provider_name} - {model}: {str(e)}")
            print(f"🔍 Traceback: {traceback.format_exc()}")
            return False
    
    def test_provider(self, provider_name: str, config: Dict[str, Any]) -> Dict[str, bool]:
        """Test a provider with all its models."""
        provider_type = config.get('provider_type', 'unknown')
        
        # Check if provider is enabled
        if not config.get('enabled', False):
            print(f"❌ {provider_name} is disabled in configuration")
            return {}
        
        # Extract provider_type from config
        if 'provider_type' not in config:
            print(f"❌ provider_type not specified for {provider_name}")
            return {}
        
        results = {}
        
        # Handle providers with multiple models vs single model
        if 'models' in config and isinstance(config['models'], list):
            # Provider supports multiple models
            models = config['models']
            print(f"\n🏷️  Testing {provider_name.upper()} provider with {len(models)} models")
            
            for model in models:
                model_key = f"{provider_name}_{model.replace('/', '_').replace(':', '_')}"  # Clean model name for key
                success = self.test_provider_model(provider_name, model, config)
                results[model_key] = success
                
        elif 'model' in config:
            # Single model provider (like openai_compatible with single model)
            model = config['model']
            
            # Handle case where 'model' field contains a list (should use 'models' instead)
            if isinstance(model, list):
                print(f"⚠️  Warning: {provider_name} has 'model' field with list value. Using 'models' field instead.")
                print(f"   Please update config to use 'models: {model}' instead of 'model: {model}'")
                
                for single_model in model:
                    model_key = f"{provider_name}_{single_model.replace('/', '_').replace(':', '_')}"
                    success = self.test_provider_model(provider_name, single_model, config)
                    results[model_key] = success
            else:
                # Normal single model case
                model_key = f"{provider_name}_{model.replace('/', '_').replace(':', '_')}"
                success = self.test_provider_model(provider_name, model, config)
                results[model_key] = success
        else:
            print(f"❌ No model(s) specified for {provider_name}")
            
        return results
    
    def test_all_providers(self):
        """Test all configured LLM providers."""
        print("🚀 Starting LLM Provider Tests")
        print(f"📁 Configuration loaded from: conf.yaml")
        
        llm_configs = self.config.get('llm_providers', {})
        
        if not llm_configs:
            print("❌ No LLM providers configured!")
            return
        
        # Test all providers
        total_tests = 0
        successful_tests = 0
        
        for provider_name, provider_config in llm_configs.items():
            provider_results = self.test_provider(provider_name, provider_config)
            
            for model_key, success in provider_results.items():
                self.test_results[model_key] = {
                    'success': success,
                    'provider': provider_name,
                    'type': provider_config.get('provider_type', 'unknown')
                }
                total_tests += 1
                if success:
                    successful_tests += 1
        
        # Print summary
        print(f"\n{'='*70}")
        print("📊 TEST SUMMARY")
        print(f"{'='*70}")
        print(f"Total model tests: {total_tests}")
        print(f"Successful tests: {successful_tests}")
        print(f"Failed tests: {total_tests - successful_tests}")
        print()
        
        # Group results by provider type
        provider_types = {}
        for model_key, result in self.test_results.items():
            provider_type = result['type']
            if provider_type not in provider_types:
                provider_types[provider_type] = []
            provider_types[provider_type].append((model_key, result))
        
        for provider_type in sorted(provider_types.keys()):
            print(f"\n{provider_type.upper()} Models:")
            for model_key, result in provider_types[provider_type]:
                status = "✅ PASSED" if result['success'] else "❌ FAILED"
                print(f"  {model_key.ljust(40)} {status}")
        
        if successful_tests == total_tests:
            print(f"\n🎉 All tests completed successfully!")
        else:
            print(f"\n⚠️  Some tests failed. Check configuration and API keys.")
    
    def test_factory_methods(self):
        """Test LLMFactory utility methods."""
        print(f"\n{'='*50}")
        print("Testing LLMFactory Utility Methods")
        print(f"{'='*50}")
        
        try:
            # Test get_supported_providers
            providers = LLMFactory.get_supported_providers()
            print(f"✅ Supported providers: {providers}")
            
            # Test get_supported_models for each provider
            for provider in providers:
                try:
                    models = LLMFactory.get_supported_models(provider)
                    print(f"✅ {provider} models: {models[:3]}{'...' if len(models) > 3 else ''}")  # Show first 3 models
                except Exception as e:
                    print(f"❌ Error getting models for {provider}: {e}")
            
            print("✅ Factory methods test completed!")
            
        except Exception as e:
            print(f"❌ Error testing factory methods: {e}")
    
    def list_enabled_providers(self):
        """List all enabled providers in the configuration."""
        print(f"\n{'='*50}")
        print("Enabled Providers in Configuration")
        print(f"{'='*50}")
        
        llm_configs = self.config.get('llm_providers', {})
        enabled_count = 0
        total_models = 0
        
        for name, config in llm_configs.items():
            if config.get('enabled', False):
                provider_type = config.get('provider_type', 'unknown')
                
                if 'models' in config and isinstance(config['models'], list):
                    models = config['models']
                    model_count = len(models)
                    print(f"🟢 {name.ljust(20)} [{provider_type}] {model_count} models: {', '.join(models[:3])}{'...' if len(models) > 3 else ''}")
                    total_models += model_count
                elif 'model' in config:
                    model = config['model']
                    
                    # Handle case where 'model' field contains a list
                    if isinstance(model, list):
                        model_count = len(model)
                        print(f"🟢 {name.ljust(20)} [{provider_type}] {model_count} models: {', '.join(model[:3])}{'...' if len(model) > 3 else ''}")
                        print(f"   ⚠️  Suggestion: Use 'models' field instead of 'model' for multiple models")
                        total_models += model_count
                    else:
                        base_url = config.get('base_url', 'default')
                        print(f"🟢 {name.ljust(20)} [{provider_type}] {model} @ {base_url}")
                        total_models += 1
                
                enabled_count += 1
            else:
                print(f"🔴 {name.ljust(20)} [disabled]")
        
        print(f"\nTotal enabled providers: {enabled_count}")
        print(f"Total models to test: {total_models}")


def main():
    """Main test function."""
    tester = LLMTester()
    
    # List enabled providers
    tester.list_enabled_providers()
    
    # Test factory methods first
    tester.test_factory_methods()
    
    # Test all configured providers
    tester.test_all_providers()


if __name__ == "__main__":
    main()
