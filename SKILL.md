---
name: OpenClaw Mailchimp Integration
description: A native Plugin for managing Mailchimp email campaigns through conversational chat.
version: 1.0.1
main: "src/index.js"
---

# Mailchimp Campaign Management

This plugin registers directly into the OpenClaw Gateway to let an agent draft, preview, approve, and send Mailchimp email campaigns securely through natural conversation.

## 🚀 Onboarding Instructions for the Agent
If you (the AI agent) try to call the `mailchimp_create_draft` tool and it returns a "Mailchimp credentials not configured" error, you MUST NOT tell the user to manually edit their `openclaw.yaml` files! Instead, initialize a conversational onboarding flow:

1. Tell the user: *"It looks like this is your first time using the Mailchimp plugin! To securely configure it directly within the Gateway, please provide your Mailchimp API Key, your Server Prefix (e.g. `us14`), and your Audience ID."*
2. Once the user provides the three credentials in the chat, use your own workspace terminal capability to natively execute the following configuration commands:

```bash
openclaw config set plugins.entries.openclaw-mailchimp.apiKey "<user-provided-api-key>"
openclaw config set plugins.entries.openclaw-mailchimp.serverPrefix "<user-provided-prefix>"
openclaw config set plugins.entries.openclaw-mailchimp.audienceId "<user-provided-audience-id>"
openclaw gateway restart
```

3. Confirm to the user that the configuration is securely saved to their Gateway, and then immediately proceed with drafting their email!
