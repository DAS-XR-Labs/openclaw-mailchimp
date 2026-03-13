<div align="center">
  <img src="https://raw.githubusercontent.com/mergisi/openclaw/main/docs/public/logo.png" width="100"/>
  <h1>Mailchimp Integration for OpenClaw</h1>
  <p><h3>The Gatekeeper for AI Email Campaigns</h3></p>
  <p>Allow your OpenClaw AI Assistant to draft, schedule, and request interactive human approval for Mailchimp campaigns directly from your phone!</p>
</div>

<hr/>

## 🚀 Why this exists (And why it's awesome)

AI agents shouldn't be blindly trusted to blast thousands of subscribers without a human double-checking the email first. 

This integration acts as a **Gatekeeper Tool** for your AI:
1. Your AI hits this webhook with a proposed `subject`, `body`, and `send_time`. 
2. The tool builds the exact email in Mailchimp but **does not send it**.
3. It immediately fires an interactive "Approve/Reject" popup to the user's phone (via Slack, Telegram, WhatsApp, etc.).
4. When the user taps "Approve", the tool finalizes the schedule in Mailchimp. **You never have to log into Mailchimp!**

---

## 🛠️ Step-by-Step Guide for Non-Programmers

This guide is written specifically for users hosting their AI on a **Hostinger VPS** (or any Ubuntu/Debian server). No coding experience is required! 

We've created an automated installer that does 99% of the work for you.

### Step 1: Connect to your Hostinger VPS

1. Log into your Hostinger Dashboard.
2. Go to **VPS** -> Select your server.
3. Find your **SSH IP Address**, **Username** (usually `root`), and the **Password** you set.
4. Open the **Terminal** (Mac) or **Command Prompt** (Windows) on your home computer.
5. Type the following command and press Enter (replace `YOUR_IP` with the IP Address):
   ```bash
   ssh root@YOUR_IP
   ```
   *(It will ask for your password. When you type the password, nothing will show on the screen. This is normal! Just type it and press Enter.)*

### Step 2: Download the Code

Once you are logged into the black server screen, copy and paste this command to download the integration:

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/openclaw-mailchimp.git
cd openclaw-mailchimp
```

### Step 3: Run the Magic Installer! 🪄

Now, run the automated setup script. 
*Note: You will need your Mailchimp API Key, Prefix (like `us14`), and Audience ID handy.*

```bash
chmod +x deploy/install.sh
./deploy/install.sh
```

**What the installer does automatically:**
- Asks you for your Mailchimp keys so you don't have to edit confusing files!
- Installs all the behind-the-scenes requirements (Python, pip, etc).
- Creates a "background service" so this API runs 24/7 forever, even when you close the window.
- Sets up an **Auto-Updater!** *Every 5 minutes, it checks your GitHub repository. If you've merged new updates, it instantly pulls the new code and restarts itself without you lifting a finger!*

### Step 4: Link it to OpenClaw

When the installer finishes, it will give you a URL that looks like this:
👉 `http://123.45.67.89:8000/openapi.json`

Because the Hostinger template runs securely behind the scenes without a public Web Interface, the absolute fastest way to install this skill is directly through the chat interface where you usually talk to OpenClaw (like Telegram, Discord, or the CLI)!

Send this exact message to your OpenClaw agent:

> *"Please learn the new Mailchimp OpenClaw skill by reading my SKILL.md and OpenAPI schema at `http://YOUR_SERVER_IP:8000/openapi.json`"*

*(Be sure to replace the `YOUR_SERVER_IP` URL with the real one the installer gave you).*

**Boom!** 💥 Your OpenClaw Agent instantly learns how to use Mailchimp. You can test it right there in the chat by saying: *"Test the Mailchimp tool by drafting an email about our new summer sale and schedule it for next Tuesday."*

---

## ⚙️ Advanced: Checking the Logs

If things go wrong and you need to see what the server is doing behind the scenes, you can view the live logs at any time:

```bash
sudo journalctl -u openclaw-mailchimp -f
```
*(Press `CTRL + C` to exit the logs).*
