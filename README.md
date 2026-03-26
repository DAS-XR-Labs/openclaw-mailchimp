<div align="center">
  <img src="https://raw.githubusercontent.com/mergisi/openclaw/main/docs/public/logo.png" width="100"/>
  <h1>Mailchimp Integration for OpenClaw</h1>
  <p><h3>The Conversational Email Gatekeeper</h3></p>
  <p>Allow your OpenClaw AI Assistant to draft, preview, and request conversational human approval for Mailchimp campaigns directly from your AI Gateway!</p>
</div>

<hr/>

## 🚀 Why this exists

AI agents shouldn't be blindly trusted to blast thousands of subscribers without a human double-checking the email first. 

This is a **Native OpenClaw Plugin** that registers into your OpenClaw Gateway to handle email blasts securely via natural chat flows:
1. You tell OpenClaw: *"Draft an email about our summer sale."*
2. OpenClaw calls the Mailchimp API seamlessly, drafting it on your account.
3. OpenClaw provides the Preview Link straight into the chat and asks: *"Would you like me to send it, rewrite it, or delete it?"*
4. You click the preview link, confirm it's correct, and reply: *"Send it!"*
5. OpenClaw instantly dispatches it. 

**Zero Webhooks, Zero OpenAPI configurations, Zero External Servers!**

---

## 🛠️ Installation Guide

Because this is a native OpenClaw module, you can install and configure it entirely through conversation with your AI! The AI has internal workspace terminal access to install it on your behalf.

### Step 1: Install the Plugin via Chat
1. Open your **OpenClaw Chat Interface**.
2. Send the following exact message to instruct the AI to clone and structurally register the Mailchimp plugin directly into its gateway:

> *Please run the following commands in your workspace terminal to successfully clone and register the open-source Mailchimp architecture into your execution Gateway:*
> 
> ```bash
> git clone https://github.com/DAS-XR-Labs/openclaw-mailchimp.git ~/.openclaw/workspace/skills/openclaw-mailchimp
> openclaw plugins install ~/.openclaw/workspace/skills/openclaw-mailchimp
> openclaw gateway restart
> ```

### Step 2: Auto-Configure your Settings 🪄
You don't need to manually edit any `openclaw.yaml` files! 
Once the Gateway restarts from the previous step, just send this exact command to your AI:

> *"Please review the local `SKILL.md` inside your newly installed Mailchimp plugin workspace directory."*

Because of the plugin's aggressive conversational onboarding instructions, the AI will instantly realize it needs your API Keys and will natively reply: 

> *"It looks like this is your first time using the Mailchimp plugin! To securely configure it directly within the Gateway, please provide your Mailchimp API Key, your Server Prefix (e.g. `us14`), and your Audience ID."*

Just paste your info into the chat! The AI will natively execute the required `openclaw config set` variables securely into its own internal systems and permanently save the keys for all future sessions!

**Boom!** 💥 Your OpenClaw Gateway is now an email marketer. Test it by saying: *"Test the Mailchimp plugin by drafting an email about our new summer sale and return my preview link!"*
