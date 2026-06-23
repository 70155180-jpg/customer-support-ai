from crewai import Task
from agents import classifier_agent

task1 = Task(
    description="""
User message:
{message}

Classify into ONLY ONE:
FAQ
Escalation
Resolution

Return only one word.
""",
    agent=classifier_agent,
    expected_output="One word only"
)