from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
def classify_ticket(ticket: Ticket):
    text = ticket.text.lower()

    if "refund" in text:
        return {"agent": "FAQ Agent", "category": "billing"}
    elif "error" in text:
        return {"agent": "Escalation Agent", "category": "technical"}
    else:
        return {"agent": "FAQ Agent", "category": "general"}