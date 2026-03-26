<div align="center">
  <img src="https://raw.githubusercontent.com/mergisi/openclaw/main/docs/public/logo.png" width="100"/>
  <h1>Mailchimp Integration for OpenClaw</h1>
  <p><h3>The Conversational Email Gatekeeper</h3></p>
  <p>Allow your OpenClaw AI Assistant to draft, preview, and request conversational human approval for Mailchimp campaigns locally inside your AI without an external server!</p>
</div>

<hr/>

## 🚀 Why this exists

AI agents shouldn't be blindly trusted to blast thousands of subscribers without a human double-checking the email first. 

This is a **Native OpenClaw JavaScript Skill** that handles email blasts via natural chat flows:
1. You tell OpenClaw: *"Draft an email about our summer sale."*
2. OpenClaw calls the Mailchimp API recursively in the background, drafting it securely on your account.
3. OpenClaw replies in chat: *"It's drafted! Here is the Preview Link: `[URL]`. Would you like me to send it, rewrite it, or delete it?"*
4. You click the preview link, read it, and reply: *"Looks great, send it!"*
5. OpenClaw instantly sends it. 

**Zero Webhooks, Zero OpenAPI configurations, Zero External Servers!**

---

## 🛠️ Installation Guide

Because this is a native OpenClaw plugin, it runs entirely within your OpenClaw Node.js process. 

### Step 1: Install the Skill via Chat
You don't need direct SSH access to your VPS! If you are chatting with OpenClaw (Clawboss), the assistant has the ability to run terminal commands inside its own workspace.

1. Open your **OpenClaw Chat Interface**.
2. Send the following exact message to tell OpenClaw to clone the integration into its skills folder:

> *Please run the following commands in your terminal to clone and install the open-source Mailchimp integration:*
> 
> ```bash
> git clone https://github.com/DAS-XR-Labs/openclaw-mailchimp.git ~/.openclaw/workspace/skills/openclaw-mailchimp
> openclaw plugins install ~/.openclaw/workspace/skills/openclaw-mailchimp
> openclaw gateway restart
> ```

### Step 2: Configure your Keys 🪄

Before using the tool, you must configure your OpenClaw Gateway to securely provide the credentials. Open your `openclaw.yaml` configuration file and add the following entry to your plugins block:

```yaml
plugins:
  entries:
    openclaw-mailchimp:
      apiKey: "your-api-key-here"
      serverPrefix: "us14" # The string at the end of your apiKey
      audienceId: "your-audience-id"
```

**Boom!** 💥 Your OpenClaw Agent is now an email marketer. Test it by saying: *"Test the Mailchimp tool by drafting an email about our new summer sale and return my preview link!"*
