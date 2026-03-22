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

If the agent tries to create a draft and credentials are missing, it will receive an error. The agent should tell the user to configure the plugin credentials in `openclaw.yaml` or via `openclaw config set plugins.entries.openclaw-mailchimp.config.apiKey <key>`.
