const mailchimp = require("@mailchimp/mailchimp_marketing");

/**
 * OpenClaw plugin: Mailchimp campaign management.
 *
 * Credentials come from openclaw.yaml → plugins.entries.openclaw-mailchimp:
 *   apiKey, serverPrefix, audienceId
 */

function initClient(pluginConfig) {
  const apiKey = pluginConfig?.apiKey;
  const server = pluginConfig?.serverPrefix;
  if (!apiKey || !server) {
    throw new Error(
      "Mailchimp credentials not configured. Set apiKey and serverPrefix in openclaw.yaml under plugins.entries.openclaw-mailchimp."
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
        subject: {
          type: "string",
          description: "The subject line of the email campaign.",
        },
        body: {
          type: "string",
          description: "The HTML body content of the email.",
        },
        sendTime: {
          type: "string",
          description:
            "A human-readable note about when this should be sent (e.g. 'tomorrow morning').",
        },
      },
      required: ["subject", "body"],
    },
    async execute(_id, params) {
      const cfg = initClient(pluginConfig);
      const audienceId = cfg.audienceId;
      if (!audienceId) {
        throw new Error(
          "Mailchimp audienceId not configured. Set audienceId in openclaw.yaml under plugins.entries.openclaw-mailchimp."
        );
      }

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
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                campaignId,
                previewUrl,
                message: "Draft created successfully.",
              },
              null,
              2
            ),
          },
        ],
      };
    },
  };
}

function createSendTool(pluginConfig) {
  return {
    name: "mailchimp_send_campaign",
    description:
      "Send an existing Mailchimp campaign immediately. Only call this after the user has explicitly approved the draft.",
    parameters: {
      type: "object",
      properties: {
        campaignId: {
          type: "string",
          description: "The Mailchimp campaign ID to send.",
        },
      },
      required: ["campaignId"],
    },
    async execute(_id, params) {
      initClient(pluginConfig);
      const campaignId = params.campaignId;
      await mailchimp.campaigns.send(campaignId);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: `Campaign ${campaignId} has been approved and sent.`,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  };
}

function createDeleteTool(pluginConfig) {
  return {
    name: "mailchimp_delete_campaign",
    description:
      "Delete (reject) an existing Mailchimp campaign draft. Use this when the user declines to send a draft.",
    parameters: {
      type: "object",
      properties: {
        campaignId: {
          type: "string",
          description: "The Mailchimp campaign ID to delete.",
        },
      },
      required: ["campaignId"],
    },
    async execute(_id, params) {
      initClient(pluginConfig);
      const campaignId = params.campaignId;
      await mailchimp.campaigns.remove(campaignId);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: `Campaign ${campaignId} has been rejected and deleted.`,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  };
}

// OpenClaw plugin export — the loader calls register(api) on startup
module.exports = {
  id: "openclaw-mailchimp",
  name: "Mailchimp",
  description:
    "Draft, preview, approve, and send Mailchimp email campaigns through chat",
  version: "1.0.1",

  register(api) {
    const pluginConfig = api.pluginConfig || {};

    api.registerTool(createDraftTool(pluginConfig), {
      name: "mailchimp_create_draft",
    });
    api.registerTool(createSendTool(pluginConfig), {
      name: "mailchimp_send_campaign",
    });
    api.registerTool(createDeleteTool(pluginConfig), {
      name: "mailchimp_delete_campaign",
    });

    api.logger.info("Mailchimp plugin registered (3 tools)");
  },
};
