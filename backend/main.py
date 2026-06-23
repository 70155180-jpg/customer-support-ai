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
    ticket_id = f"TICKET-{uuid4().hex[:6].upper()}"

    if any(word in text for word in ["refund", "payment", "charged", "invoice", "billing"]):
        category = "billing"
        agent = "Billing Support Agent"
        priority = "medium"
    elif any(word in text for word in ["error", "bug", "crash", "not working", "failed"]):
        category = "technical"
        agent = "Technical Escalation Agent"
        priority = "high"
    elif any(word in text for word in ["login", "password", "account", "profile"]):
        category = "account"
        agent = "Account Support Agent"
        priority = "medium"
    elif any(word in text for word in ["delivery", "shipping", "order", "tracking"]):
        category = "delivery"
        agent = "Delivery Support Agent"
        priority = "medium"
    elif any(word in text for word in ["angry", "complaint", "bad service", "unhappy"]):
        category = "complaint"
        agent = "Customer Care Agent"
        priority = "high"
    else:
        category = "general"
        agent = "FAQ Agent"
        priority = "low"

    return {
        "ticket_id": ticket_id,
        "agent": agent,
        "category": category,
        "priority": priority,
        "message": f"Your ticket has been assigned to the {agent} for {category} support."
    }
