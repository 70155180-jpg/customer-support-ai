from datetime import datetime, timezone
from uuid import uuid4

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Autonomous Customer Support Ecosystem")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Ticket(BaseModel):
    text: str
    customer_tier: str = "standard"
    channel: str = "web"


def contains_any(text, words):
    return any(word in text for word in words)


def classify_ticket(text, customer_tier):
    if contains_any(text, ["refund", "payment", "charged", "invoice", "billing", "subscription"]):
        return {
            "category": "billing",
            "priority": "medium",
            "confidence": 94,
            "sla": "4 hours",
            "tags": ["billing", "payment", "finance-review"],
        }
    if contains_any(text, ["error", "bug", "crash", "not working", "failed", "api", "timeout"]):
        return {
            "category": "technical",
            "priority": "high",
            "confidence": 91,
            "sla": "2 hours",
            "tags": ["technical", "incident", "engineering-review"],
        }
    if contains_any(text, ["login", "password", "account", "profile", "verify", "locked"]):
        return {
            "category": "account",
            "priority": "medium",
            "confidence": 88,
            "sla": "4 hours",
            "tags": ["account", "access", "identity"],
        }
    if contains_any(text, ["delivery", "shipping", "order", "tracking", "late", "package"]):
        return {
            "category": "delivery",
            "priority": "medium",
            "confidence": 86,
            "sla": "6 hours",
            "tags": ["delivery", "order", "tracking"],
        }
    if contains_any(text, ["angry", "complaint", "bad service", "unhappy", "cancel", "manager"]):
        return {
            "category": "complaint",
            "priority": "high",
            "confidence": 89,
            "sla": "1 hour",
            "tags": ["complaint", "retention", "urgent"],
        }

    priority = "medium" if customer_tier == "enterprise" else "low"
    return {
        "category": "general",
        "priority": priority,
        "confidence": 76,
        "sla": "8 hours" if customer_tier == "enterprise" else "12 hours",
        "tags": ["general", "triage"],
    }


def build_agent_workflow(classification):
    category = classification["category"]
    priority = classification["priority"]
    needs_human = priority == "high" or category in ["technical", "complaint"]
    handler = "Escalation Agent" if needs_human else "FAQ Agent"

    return [
        {
            "agent": "Classifier Agent",
            "status": "complete",
            "output": f"Routed ticket to {category} queue with {classification['confidence']}% confidence.",
        },
        {
            "agent": handler,
            "status": "complete" if not needs_human else "human-review",
            "output": "Resolved using knowledge base." if not needs_human else "Human specialist added to the loop.",
        },
        {
            "agent": "Resolution Agent",
            "status": "complete",
            "output": "Generated suggested reply and next-best action.",
        },
        {
            "agent": "QA Agent",
            "status": "complete",
            "output": "Checked tone, completeness, risk, and escalation policy.",
        },
    ]


def build_resolution(category):
    playbooks = {
        "billing": {
            "article": "KB-BILL-204 Refund and Duplicate Charge Policy",
            "reply": "Thanks for contacting us. We are reviewing the payment record and will confirm refund eligibility shortly.",
            "next_action": "Verify invoice ID, payment status, and refund window.",
        },
        "technical": {
            "article": "KB-TECH-118 Incident Troubleshooting Checklist",
            "reply": "We have escalated this to technical support. Please share screenshots, device details, and steps to reproduce.",
            "next_action": "Create engineering investigation task and request diagnostic details.",
        },
        "account": {
            "article": "KB-ACC-031 Secure Account Recovery",
            "reply": "We will help you restore access. Please do not share passwords or verification codes in the ticket.",
            "next_action": "Trigger secure identity verification workflow.",
        },
        "delivery": {
            "article": "KB-OPS-072 Shipment Tracking and Delay Handling",
            "reply": "We are checking tracking updates with the delivery team and will share the latest status.",
            "next_action": "Check order ID, carrier status, and delivery exception reason.",
        },
        "complaint": {
            "article": "KB-CX-015 High-Risk Complaint Recovery",
            "reply": "We are sorry about this experience. A customer care specialist will review this with priority.",
            "next_action": "Assign retention owner and prepare service recovery options.",
        },
        "general": {
            "article": "KB-GEN-001 General Support Triage",
            "reply": "Thanks for reaching out. We have received your request and will route it to the right team.",
            "next_action": "Collect missing information and continue triage.",
        },
    }
    return playbooks[category]


def build_quality_audit(text, classification):
    has_sensitive_terms = contains_any(text, ["password", "card", "otp", "ssn"])
    score = classification["confidence"] - (8 if has_sensitive_terms else 0)
    return {
        "qa_score": max(score, 60),
        "tone": "empathetic",
        "risk_level": "elevated" if has_sensitive_terms or classification["priority"] == "high" else "normal",
        "checks": [
            "Category and priority selected",
            "Suggested reply generated",
            "SLA assigned",
            "Sensitive information warning checked",
        ],
    }


@app.get("/")
def home():
    return {
        "message": "Autonomous Customer Support Ecosystem backend is running",
        "agents": ["Classifier", "FAQ", "Escalation", "Resolution", "QA"],
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "mode": "safe-demo",
        "integrations": {
            "CrewAI": "workflow simulated",
            "Zendesk API": "payload preview only",
            "PostgreSQL": "record preview only",
        },
    }


@app.post("/classify")
@app.post("/api/classify")
def process_ticket(ticket: Ticket):
    text = ticket.text.lower()
    ticket_id = f"TICKET-{uuid4().hex[:8].upper()}"
    classification = classify_ticket(text, ticket.customer_tier)
    resolution = build_resolution(classification["category"])
    workflow = build_agent_workflow(classification)
    audit = build_quality_audit(text, classification)

    needs_human = classification["priority"] == "high" or classification["category"] in ["technical", "complaint"]
    assigned_agent = "Escalation Agent" if needs_human else "FAQ Agent"

    return {
        "ticket_id": ticket_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "category": classification["category"],
        "priority": classification["priority"],
        "confidence": classification["confidence"],
        "sla": classification["sla"],
        "tags": classification["tags"],
        "assigned_agent": assigned_agent,
        "human_required": needs_human,
        "message": f"{assigned_agent} is handling this {classification['category']} ticket.",
        "suggested_reply": resolution["reply"],
        "next_action": resolution["next_action"],
        "knowledge_article": resolution["article"],
        "workflow": workflow,
        "qa": audit,
        "integration_preview": {
            "zendesk_payload": {
                "subject": f"{classification['category'].title()} support request",
                "priority": classification["priority"],
                "tags": classification["tags"],
                "status": "open" if needs_human else "pending",
            },
            "postgres_record": {
                "ticket_id": ticket_id,
                "category": classification["category"],
                "priority": classification["priority"],
                "qa_score": audit["qa_score"],
            },
        },
    }
