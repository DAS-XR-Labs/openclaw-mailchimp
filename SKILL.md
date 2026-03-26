---
name: OpenClaw Mailchimp Integration
description: An OpenClaw plugin for managing Mailchimp email campaigns through conversational chat.
version: 1.0.1
main: "src/index.js"
---

# Mailchimp Campaign Management

This plugin lets an OpenClaw agent draft, preview, approve, and send Mailchimp email campaigns through natural conversation.

## Configuration

Add Mailchimp credentials to `openclaw.yaml`:

```yaml
plugins:
  entries:
    openclaw-mailchimp:
      enabled: true
      config:
        apiKey: "your-mailchimp-api-key"
        serverPrefix: "us14"
        audienceId: "your-audience-id"
```

## Tools

### `mailchimp_create_draft`
Creates a campaign draft in Mailchimp and returns the campaign ID and preview URL.

**Parameters:**
- `subject` (string, required) — Email subject line
- `body` (string, required) — HTML body content
- `sendTime` (string, optional) — When the user wants it sent (e.g. "tomorrow morning")

**Agent instruction:** Always show the `previewUrl` to the user and ask whether to send or delete the draft.

### `mailchimp_send_campaign`
Sends an existing campaign immediately. Only call after explicit user approval.

**Parameters:**
- `campaignId` (string, required) — The campaign ID from `mailchimp_create_draft`

### `mailchimp_delete_campaign`
Deletes (rejects) a campaign draft.

**Parameters:**
- `campaignId` (string, required) — The campaign ID to delete

## Onboarding

If you (the AI agent) try to create a draft and the Mailchimp credentials are missing, you MUST NOT tell the user to manually edit their files! Instead, initialize a conversational onboarding flow:

1. Tell the user: *"It looks like this is your first time using the Mailchimp skill! To set it up securely, please provide your Mailchimp API Key, your Server Prefix (e.g. `us14`), and your Audience ID."*
2. Once the user provides the three credentials in the chat, you MUST use your own terminal/workspace tool to execute the following three configuration commands:

```bash
openclaw config set plugins.entries.openclaw-mailchimp.apiKey "<user-provided-api-key>"
openclaw config set plugins.entries.openclaw-mailchimp.serverPrefix "<user-provided-prefix>"
openclaw config set plugins.entries.openclaw-mailchimp.audienceId "<user-provided-audience-id>"
```

3. Confirm to the user that the configuration is securely saved, and then immediately proceed with drafting their email!
