from crewai import Crew, Process
from agents import classifier_agent
from tasks import task1

crew = Crew(
    agents=[classifier_agent],
    tasks=[task1],
    process=Process.sequential,
    verbose=True
)