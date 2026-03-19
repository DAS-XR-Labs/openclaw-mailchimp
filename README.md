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
Since the integration runs transparently as a native extension inside your pre-existing environment, you do not need SSH access to the server!

1. Open your **OpenClaw Chat Interface**.
2. Send the following command to securely download and install this skill straight from GitHub:

> *"/install git+https://github.com/DAS-XR-Labs/openclaw-mailchimp.git"*

### Step 2: Configure your Agent 🪄

You don't need to manually edit any files! Just open your **OpenClaw Chat Interface** and send this exact command so your AI reads the configuration:

> *"Please review the local `SKILL.md` for the internal Mailchimp plugin we just installed."*

Your AI will instantly realize it needs your configuration credentials and will reply: 
> *"It looks like this is your first time using the Mailchimp skill! To set it up, could you provide your Mailchimp API Key, the Server Prefix (like `us14`), and your Audience ID?"*

Just paste your info into the chat, and the AI will securely configure itself and save the keys for all future sessions!

**Boom!** 💥 Your OpenClaw Agent is now an email marketer. Test it by saying: *"Test the Mailchimp tool by drafting an email about our new summer sale and return my preview link!"*
