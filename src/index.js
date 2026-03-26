const mailchimp = require("@mailchimp/mailchimp_marketing");

/**
 * OpenClaw plugin: Mailchimp campaign management.
 * Credentials come from openclaw.yaml → plugins.entries.openclaw-mailchimp.
 */

function initClient(pluginConfig) {
  const apiKey = pluginConfig?.apiKey;
  const server = pluginConfig?.serverPrefix;
  if (!apiKey || !server) {
    throw new Error(
      "Mailchimp credentials not configured. Please execute conversational onboarding!"
    );
  }
  mailchimp.setConfig({ apiKey, server });
  return pluginConfig;
}

function createDraftTool(pluginConfig) {
  return {
    name: "mailchimp_create_draft",
    description:
      "Create a Mailchimp email campaign draft. Returns the campaign ID and preview URL. Always show the preview URL to the user and ask for approval before sending.",
    parameters: {
      type: "object",
      properties: {
        subject: { type: "string", description: "The subject line of the email campaign." },
        body: { type: "string", description: "The HTML body content of the email." },
        sendTime: { type: "string", description: "When this should be sent." },
      },
      required: ["subject", "body"],
    },
    async execute(_id, params) {
      const cfg = initClient(pluginConfig);
      const audienceId = cfg.audienceId;
      if (!audienceId) throw new Error("Mailchimp audienceId not configured.");

      const subject = params.subject;
      const body = params.body;
      const sendTime = params.sendTime || "not specified";

      const response = await mailchimp.campaigns.create({
        type: "regular",
        recipients: { list_id: audienceId },
        settings: {
          subject_line: subject,
          title: `OpenClaw Draft: ${subject}`,
          from_name: "OpenClaw Agent",
          reply_to: "noreply@example.com",
        },
      });

      const campaignId = response.id;
      const previewUrl =
        response.archive_url ||
        response.long_archive_url ||
        `https://${cfg.serverPrefix}.admin.mailchimp.com/campaigns/show/?id=${campaignId}`;

      await mailchimp.campaigns.setContent(campaignId, {
        html: `<p>${body}</p><br><p><em>Scheduled intent: ${sendTime}</em></p>`,
      });

      return {
        content: [{ type: "text", text: JSON.stringify({ campaignId, previewUrl, message: "Draft created successfully." }, null, 2) }],
      };
    },
  };
}

function createSendTool(pluginConfig) {
  return {
    name: "mailchimp_send_campaign",
    description: "Send an existing Mailchimp campaign immediately. Only call this after the user has explicitly approved the draft.",
    parameters: {
      type: "object",
      properties: { campaignId: { type: "string", description: "The Mailchimp campaign ID to send." } },
      required: ["campaignId"],
    },
    async execute(_id, params) {
      initClient(pluginConfig);
      await mailchimp.campaigns.send(params.campaignId);
      return { content: [{ type: "text", text: `{"status": "Campaign ${params.campaignId} has been approved and sent."}` }] };
    },
  };
}

function createDeleteTool(pluginConfig) {
  return {
    name: "mailchimp_delete_campaign",
    description: "Delete (reject) an existing Mailchimp campaign draft.",
    parameters: {
      type: "object",
      properties: { campaignId: { type: "string", description: "The Mailchimp campaign ID to delete." } },
      required: ["campaignId"],
    },
    async execute(_id, params) {
      initClient(pluginConfig);
      await mailchimp.campaigns.remove(params.campaignId);
      return { content: [{ type: "text", text: `{"status": "Campaign ${params.campaignId} has been rejected and deleted."}` }] };
    },
  };
}

function createUpdateTool() {
  return {
    name: "mailchimp_check_for_updates",
    description: "Check GitHub to see if a newer version of the Mailchimp plugin is available.",
    parameters: { type: "object", properties: {}, required: [] },
    async execute() {
        try {
            const pkgPath = require('path').resolve(__dirname, '../package.json');
            const localPkg = require(pkgPath);
            const localVersion = localPkg.version || '1.0.0';

            const remoteUrl = 'https://raw.githubusercontent.com/DAS-XR-Labs/openclaw-mailchimp/main/package.json';
            const fetchCmd = typeof fetch !== 'undefined' ? fetch : (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
            
            const res = await fetchCmd(remoteUrl, { headers: { 'Accept': 'application/vnd.github.v3.raw' }});
            if (!res.ok) return { content: [{ type: "text", text: `{"error": "Failed to fetch remote version. Status: ${res.status}"}` }] };

            const remotePkg = await res.json();
            const remoteVersion = remotePkg.version;

            if (localVersion !== remoteVersion) {
                return { content: [{ type: "text", text: `Update Available! You run v${localVersion}, but v${remoteVersion} is available. Tell the user to run: "cd ~/.openclaw/workspace/skills/openclaw-mailchimp && git pull origin main && openclaw gateway restart" to upgrade.` }] };
            }
            return { content: [{ type: "text", text: `You are running the latest version (v${localVersion}).` }] };
        } catch (e) {
            return { content: [{ type: "text", text: `{"error": "Failed to check for updates: ${e.message}"}` }] };
        }
    }
  };
}

module.exports = {
  id: "openclaw-mailchimp",
  name: "Mailchimp",
  description: "Draft, preview, approve, and send Mailchimp email campaigns through chat",
  version: "1.0.1",

  register(api) {
    const pluginConfig = api.pluginConfig || {};
    api.registerTool(createDraftTool(pluginConfig), { name: "mailchimp_create_draft" });
    api.registerTool(createSendTool(pluginConfig), { name: "mailchimp_send_campaign" });
    api.registerTool(createDeleteTool(pluginConfig), { name: "mailchimp_delete_campaign" });
    api.registerTool(createUpdateTool(), { name: "mailchimp_check_for_updates" });
    api.logger.info("Mailchimp plugin registered (4 tools)");
  },
};
