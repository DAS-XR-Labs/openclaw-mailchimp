---
name: OpenClaw Mailchimp Integration
description: A complete skill for integrating AI agents with Mailchimp to draft, approve, and schedule email campaigns without requiring user logins.
---

# OpenClaw Mailchimp Integration Skill

This skill allows an AI agent to accept an email draft context, dynamically generate a Mailchimp campaign, send an interactive approval request to a messaging platform, and reliably schedule the campaign based on user consent.

## Motivation & Architecture
AI agents often need to draft emails but shouldn't be trusted to blindly blast thousands of subscribers without human review. This integration acts as a "Gatekeeper Tool" for your AI:
1. The AI hits this tool's `/submit-draft` webhook with a proposed `subject`, `body`, and `send_time`. 
2. The tool builds the exact email in Mailchimp but **does not send it**.
3. It immediately fires an interactive "Approve/Reject" popup to the user's phone (via Slack, Telegram, WhatsApp, etc.).
4. When the user taps "Approve", the tool finalizes the schedule in Mailchimp. The user never logs into Mailchimp.

## Directory Structure
- `scripts/main.py` - The core FastAPI webhook server. 
- `scripts/requirements.txt` - Python dependencies needed to run the server.
- `examples/test_payload.json` - Example JSON describing the shape of the LLM tool call payload.
- `examples/.env.example` - Template for necessary environment variables.

## Deployment & Setup Instructions

### 1. Configure the Environment
Copy `examples/.env.example` to `scripts/.env` and fill in the Mailchimp credentials:
- `MAILCHIMP_API_KEY`: Found in Mailchimp Account -> Extras -> API Keys
- `MAILCHIMP_SERVER_PREFIX`: The end of your API key (e.g., `us14`)
- `MAILCHIMP_AUDIENCE_ID`: Found in Mailchimp Audience -> Settings

### 2. Install Dependencies
Navigate into `scripts/` and run:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Run the Server
```bash
python main.py
```
*Note for VPS/Cloud deployment (e.g., Hostinger): Ensure your firewall rules open the port used (default 8000).*

## Exposing as an Agent Tool (OpenClaw / MCP / GPTs)
Because this is built in FastAPI, it automatically hosts an OpenAPI specification at `http://localhost:8000/openapi.json` (or wherever you deploy it). 
You can pass this URL directly to any AI agent framework (including the OpenClaw plugin system) that supports OpenAPI schemas to instantly register the Mailchimp scheduling capabilities as a tool for your Chat LLM.
