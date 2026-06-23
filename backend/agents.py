from crewai import Agent
from llm import llm

classifier_agent = Agent(
    role="Ticket Classifier",
    goal="Classify message into FAQ, Escalation, or Resolution",
    backstory="""
You are a strict AI classifier.

Rules:
- FAQ = general question
- Resolution = technical issue
- Escalation = serious/urgent/unclear issue
Return ONLY one word.
""",
    llm=llm,
    verbose=True
)