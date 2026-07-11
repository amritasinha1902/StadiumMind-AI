import os
from app.prompts.base_prompts import SYSTEM_PROMPT

PROMPTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "prompts"))

def _load_prompt_file(name: str) -> str:
    path = os.path.join(PROMPTS_DIR, name)
    try:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return f.read()
    except Exception as exc:
        print(f"Error loading prompt {name}: {exc}")
    return ""

GLOBAL_SYSTEM = _load_prompt_file("global_system.txt")
SUPERVISOR_INTENT_PROMPT = _load_prompt_file("supervisor_intent.txt")
SUPERVISOR_MERGE_PROMPT = _load_prompt_file("supervisor_merge.txt")

# Combine global system prompt with specialized agent templates
FAN_AGENT_PROMPT = GLOBAL_SYSTEM + "\n\n" + _load_prompt_file("fan_agent.txt")
NAVIGATION_AGENT_PROMPT = GLOBAL_SYSTEM + "\n\n" + _load_prompt_file("navigation_agent.txt")
ACCESSIBILITY_AGENT_PROMPT = GLOBAL_SYSTEM + "\n\n" + _load_prompt_file("accessibility_agent.txt")
OPERATIONS_AGENT_PROMPT = GLOBAL_SYSTEM + "\n\n" + _load_prompt_file("operations_agent.txt")
EMERGENCY_AGENT_PROMPT = GLOBAL_SYSTEM + "\n\n" + _load_prompt_file("emergency_agent.txt")
TRANSLATION_AGENT_PROMPT = GLOBAL_SYSTEM + "\n\n" + _load_prompt_file("translation_agent.txt")
SUSTAINABILITY_AGENT_PROMPT = GLOBAL_SYSTEM + "\n\n" + _load_prompt_file("sustainability_agent.txt")
