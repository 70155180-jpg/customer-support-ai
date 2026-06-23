from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from uuid import uuid4

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Request Schema
# -------------------------
class Ticket(BaseModel):
    text: str


def build_response(category, agent, priority, confidence, sla, tags, action):
    return {
        "ticket_id": f"TICKET-{uuid4().hex[:6].upper()}",
        "agent": agent,
        "category": category,
        "priority": priority,
        "confidence": confidence,
        "sla": sla,
        "tags": tags,
        "message": f"Your ticket has been assigned to the {agent} for {category} support.",
        "suggested_reply": action
    }

# -------------------------
# Test Route
# -------------------------
@app.get("/")
def home():
    return {"message": "Backend is running"}

# -------------------------
# Classifier Route
# -------------------------
@app.post("/classify")
@app.post("/api/classify")
def classify_ticket(ticket: Ticket):
    text = ticket.text.lower()

    if any(word in text for word in ["refund", "payment", "charged", "invoice", "billing"]):
        return build_response(
            "billing",
            "Billing Support Agent",
            "medium",
            92,
            "4 hours",
            ["payment", "refund", "billing"],
            "Thanks for contacting us. We are reviewing the payment details and will update you shortly."
        )
    elif any(word in text for word in ["error", "bug", "crash", "not working", "failed"]):
        return build_response(
            "technical",
            "Technical Escalation Agent",
            "high",
            89,
            "2 hours",
            ["technical", "incident", "needs-review"],
            "We have escalated this to technical support. Please share screenshots or steps to reproduce the issue."
        )
    elif any(word in text for word in ["login", "password", "account", "profile"]):
        return build_response(
            "account",
            "Account Support Agent",
            "medium",
            87,
            "4 hours",
            ["account", "access", "identity"],
            "We will help you restore account access. Please avoid sharing your password in the ticket."
        )
    elif any(word in text for word in ["delivery", "shipping", "order", "tracking"]):
        return build_response(
            "delivery",
            "Delivery Support Agent",
            "medium",
            84,
            "6 hours",
            ["order", "shipping", "tracking"],
            "We are checking the order status and tracking details with the delivery team."
        )
    elif any(word in text for word in ["angry", "complaint", "bad service", "unhappy"]):
        return build_response(
            "complaint",
            "Customer Care Agent",
            "high",
            86,
            "1 hour",
            ["complaint", "customer-care", "urgent"],
            "We are sorry about this experience. A customer care agent will review it with priority."
        )
    else:
        return build_response(
            "general",
            "FAQ Agent",
            "low",
            72,
            "12 hours",
            ["general", "triage"],
            "Thanks for reaching out. We have received your request and will route it to the right team."
        )
