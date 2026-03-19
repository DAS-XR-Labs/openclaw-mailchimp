---
name: OpenClaw Mailchimp Integration
description: A native Javascript OpenClaw skill for integrating AI agents with Mailchimp to draft, preview, approve, and send email campaigns conversationally.
version: 1.0.0
main: "src/index.js"
---

# Mailchimp Conversation Integration

This skill empowers an OpenClaw AI agent to naturally manage a user's Mailchimp email blasts through multi-turn conversational chat.

## Native Tools Exposed
This module exports three Javascript methods natively exposed to the LLM:

1. `createDraft(subject: string, body: string, sendTime: string)`
   - Used when the user requests a new email blast to be drafted.
   - It outputs the drafted `campaignId` and an interactive `previewUrl` directly into the chat buffer.
   - **Agent Instruction:** When calling this tool, ALWAYS provide the `previewUrl` to the user in chat and immediately ask if they would like to send the campaign or delete it.

2. `sendCampaign(campaignId: string)`
   - Used ONLY after the user explicitly types "Send it", "Approve", or confirms the draft.
   - Instantly schedules the campaign for sending utilizing Mailchimp's transactional APIs.

3. `deleteCampaign(campaignId: string)`
4. `configureMailchimp(apiKey: string, serverPrefix: string, audienceId: string)`
   - Used when the user first installs the skill or if the `createDraft` tool throws an error saying credentials are missing.
   - Saves the credentials permanently into the agent's safe `.env` file.

## 🚀 Onboarding Instructions for the Agent
When you (the AI) run this skill, you must first check if you have the Mailchimp keys. If you try to run `createDraft` and it returns an error about missing credentials, you MUST say to the user:
> *"It looks like this is your first time using the Mailchimp skill! To set it up, could you provide your Mailchimp API Key, the Server Prefix (like `us14`), and your Audience ID?"*

Once the user provides them, immediately call the `configureMailchimp` tool to safely store them.
