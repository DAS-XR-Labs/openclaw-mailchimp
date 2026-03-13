import os
import uvicorn
from fastapi import FastAPI, BackgroundTasks, Form, Request
from fastapi.responses import HTMLResponse
import mailchimp_marketing as MailchimpMarketing
from mailchimp_marketing.api_client import ApiClientError
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="OpenClaw Mailchimp Demo")

# --- Configuration ---
MAILCHIMP_API_KEY = os.getenv("MAILCHIMP_API_KEY")
MAILCHIMP_SERVER_PREFIX = os.getenv("MAILCHIMP_SERVER_PREFIX")
MAILCHIMP_AUDIENCE_ID = os.getenv("MAILCHIMP_AUDIENCE_ID")

# In-memory store for demo purposes 
# (In production, use Redis or a Database)
pending_campaigns = {}

try:
    client = MailchimpMarketing.Client()
    client.set_config({
        "api_key": MAILCHIMP_API_KEY,
        "server": MAILCHIMP_SERVER_PREFIX
    })
except Exception as e:
    print(f"Error initializing Mailchimp Client. Did you set the .env variables? {e}")

# --- Helper Functions ---

def create_mailchimp_campaign(subject: str, body: str, send_time: str) -> str:
    """
    Creates a regular email campaign in Mailchimp and returns its ID.
    """
    try:
        # 1. Create the Campaign metadata
        campaign_response = client.campaigns.create({"type": "regular",
           "recipients": {
               "list_id": MAILCHIMP_AUDIENCE_ID
           },
           "settings": {
               "subject_line": subject,
               "title": f"OpenClaw Draft: {subject}",
               "from_name": "OpenClaw Demo",
               "reply_to": "brennan.zuber@gmail.com" # Using a valid email format
           }
        })
        campaign_id = campaign_response["id"]
        
        # 2. Set the Campaign Content (the HTML body)
        client.campaigns.set_content(campaign_id, {
            "html": f"<p>{body}</p><br><p><em>Scheduled for: {send_time}</em></p>"
        })
        print(f"✅ Successfully created Mailchimp Campaign: {campaign_id}")
        return campaign_id
        
    except ApiClientError as error:
        print(f"❌ Mailchimp Error: {error.text}")
        raise error

def simulate_messaging_ping(campaign_id: str, subject: str, send_time: str):
    """
    Simulates sending an interactive message to Telegram/Slack/WhatsApp.
    """
    print("\n" + "="*50)
    print("🚨 [SIMULATED MESSAGE TO CLIENT PHONE] 🚨")
    print("OpenClaw has drafted a new Mailchimp Campaign.")
    print(f"Subject: {subject}")
    print(f"Requested Send Time: {send_time}")
    print("\nTo approve and schedule this campaign, click this link:")
    print(f"http://localhost:8000/approve/{campaign_id}")
    print("\nTo reject and delete this campaign, click this link:")
    print(f"http://localhost:8000/reject/{campaign_id}")
    print("="*50 + "\n")

# --- Endpoints ---

@app.get("/", response_class=HTMLResponse)
async def serve_form():
    """Serves the simple HTML form to paste the Gmail draft."""
    return """
    <html>
        <head>
            <title>OpenClaw Email Submission</title>
            <style>
                body { font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px;}
                input, textarea { width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px;}
                button { padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;}
                button:hover { background-color: #0056b3; }
            </style>
        </head>
        <body>
            <h2>Send Draft to OpenClaw</h2>
            <form action="/submit-draft" method="post">
                <label>Subject Line:</label>
                <input type="text" name="subject" required>
                
                <label>Email Body:</label>
                <textarea name="body" rows="8" required></textarea>
                
                <label>Desired Send Time (e.g., 'Tomorrow morning'):</label>
                <input type="text" name="send_time" required>
                
                <button type="submit">Send to OpenClaw</button>
            </form>
        </body>
    </html>
    """

@app.post("/submit-draft")
async def handle_draft(
    background_tasks: BackgroundTasks,
    subject: str = Form(...),
    body: str = Form(...),
    send_time: str = Form(...)
):
    """Receives the draft, creates the campaign, and pings the client."""
    print(f"📥 Received new draft: '{subject}'")
    
    try:
         # 1. Create the campaign in Mailchimp
         campaign_id = create_mailchimp_campaign(subject, body, send_time)
         
         # 2. Store minimal metadata temporarily for the approval gate
         pending_campaigns[campaign_id] = {
             "subject": subject,
             "send_time": send_time
         }
         
         # 3. Fire off the messaging request (simulated in background so HTTP returns fast)
         background_tasks.add_task(simulate_messaging_ping, campaign_id, subject, send_time)
         
         return {"message": "Draft received. Check your terminal for the simulated approval ping!"}
         
    except Exception as e:
        return {"error": str(e)}

@app.get("/approve/{campaign_id}")
async def approve_campaign(campaign_id: str):
    """Callback endpoint for when the client clicks 'Yes'."""
    if campaign_id not in pending_campaigns:
        return {"error": "Campaign not found or already processed."}
        
    try:
        # NOTE: Mailchimp scheduling requires a strict UTC timestamp rounded to a 15 min increment.
        # For this demo, since we aren't parsing the natural language "Tomorrow morning", 
        # we will simply "Send Now" when approved to prove the pipeline works without date-math errors.
        print(f"✅ Client Approved Campaign {campaign_id}. Sending now...")
        client.campaigns.send(campaign_id)
        
        del pending_campaigns[campaign_id]
        return {"status": "Success! Campaign approved and sent."}
    except ApiClientError as error:
        return {"error": f"Mailchimp Error: {error.text}"}

@app.get("/reject/{campaign_id}")
async def reject_campaign(campaign_id: str):
    """Callback endpoint for when the client clicks 'No'."""
    if campaign_id not in pending_campaigns:
        return {"error": "Campaign not found or already processed."}
        
    try:
        print(f"❌ Client Rejected Campaign {campaign_id}. Deleting from Mailchimp...")
        client.campaigns.remove(campaign_id)
        
        del pending_campaigns[campaign_id]
        return {"status": "Campaign rejected and deleted."}
    except ApiClientError as error:
        return {"error": f"Mailchimp Error: {error.text}"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
