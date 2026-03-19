require('dotenv').config();
const mailchimp = require('@mailchimp/mailchimp_marketing');

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;

if (MAILCHIMP_API_KEY && MAILCHIMP_SERVER_PREFIX) {
    mailchimp.setConfig({
        apiKey: MAILCHIMP_API_KEY,
        server: MAILCHIMP_SERVER_PREFIX,
    });
}

/**
 * Creates a regular email campaign draft in Mailchimp and returns the preview URL.
 * @param {string} subject - The subject line of the email.
 * @param {string} body - The HTML body of the email.
 * @param {string} sendTime - A human-readable note from the user determining when this should send.
 * @returns {Promise<{campaignId: string, previewUrl: string, message: string}>}
 */
async function createDraft(subject, body, sendTime) {
    if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER_PREFIX || !MAILCHIMP_AUDIENCE_ID) {
        throw new Error("Mailchimp credentials are missing from the configuration. Please ensure MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX, and MAILCHIMP_AUDIENCE_ID are set.");
    }

    try {
        // 1. Create the Campaign metadata
        const response = await mailchimp.campaigns.create({
            type: "regular",
            recipients: {
                list_id: MAILCHIMP_AUDIENCE_ID
            },
            settings: {
                subject_line: subject,
                title: `OpenClaw Draft: ${subject}`,
                from_name: "OpenClaw Agent",
                reply_to: "openclaw@example.com"
            }
        });

        const campaignId = response.id;
        const previewUrl = response.archive_url || response.long_archive_url || `https://${MAILCHIMP_SERVER_PREFIX}.admin.mailchimp.com/campaigns/show/?id=${campaignId}`;

        // 2. Set the HTML content
        await mailchimp.campaigns.setContent(campaignId, {
            html: `<p>${body}</p><br><p><em>Scheduled intent: ${sendTime}</em></p>`
        });

        return {
            campaignId,
            previewUrl,
            message: "Successfully drafted the campaign in Mailchimp."
        };
    } catch (error) {
        console.error("Mailchimp API Error:", error.response ? error.response.body : error);
        throw new Error(`Failed to create draft: ${error.message}`);
    }
}

/**
 * Approves and sends an existing Mailchimp campaign immediately.
 * @param {string} campaignId - The ID of the campaign to send.
 * @returns {Promise<{status: string}>}
 */
async function sendCampaign(campaignId) {
    try {
        await mailchimp.campaigns.send(campaignId);
        return { status: `Success! Campaign ${campaignId} has been securely approved and sent.` };
    } catch (error) {
        throw new Error(`Failed to send campaign ${campaignId}: ${error.message}`);
    }
}

/**
 * Rejects and deletes an existing Mailchimp campaign draft to keep the account clean.
 * @param {string} campaignId - The ID of the campaign to delete.
 * @returns {Promise<{status: string}>}
 */
async function deleteCampaign(campaignId) {
    try {
        await mailchimp.campaigns.remove(campaignId);
        return { status: `Success! Campaign ${campaignId} has been rejected and permanently deleted.` };
    } catch (error) {
        throw new Error(`Failed to delete campaign ${campaignId}: ${error.message}`);
    }
}

/**
 * Saves Mailchimp credentials to the root .env file so they persist for future agent sessions. 
 * This should be called by the AI after asking the user for their keys if they are currently unconfigured.
 * @param {string} apiKey - The user's full Mailchimp API Key.
 * @param {string} serverPrefix - The suffix of the Mailchimp API Key (e.g., 'us14').
 * @param {string} audienceId - The unique Mailchimp Audience ID for the email blast.
 * @returns {Promise<{status: string}>}
 */
async function configureMailchimp(apiKey, serverPrefix, audienceId) {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.resolve(process.cwd(), '.env');
    
    // Read existing .env if it exists
    let envData = '';
    if (fs.existsSync(envPath)) {
        envData = fs.readFileSync(envPath, 'utf8');
    }

    // Replace or append keys
    const updateEnv = (key, value) => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(envData)) {
            envData = envData.replace(regex, `${key}="${value}"`);
        } else {
            envData += `\n${key}="${value}"`;
        }
    };

    updateEnv('MAILCHIMP_API_KEY', apiKey);
    updateEnv('MAILCHIMP_SERVER_PREFIX', serverPrefix);
    updateEnv('MAILCHIMP_AUDIENCE_ID', audienceId);

    // Save back to .env
    fs.writeFileSync(envPath, envData.replace(/^\s*[\r\n]/gm, ''));
    
    // Dynamically apply to runtime
    process.env.MAILCHIMP_API_KEY = apiKey;
    process.env.MAILCHIMP_SERVER_PREFIX = serverPrefix;
    process.env.MAILCHIMP_AUDIENCE_ID = audienceId;
    
    mailchimp.setConfig({ apiKey, server: serverPrefix });

    return { status: `Success! Mailchimp is now securely configured and saved to .env for all future sessions.` };
}

/**
 * Checks GitHub for a newer version of this Mailchimp OpenClaw skill.
 * @returns {Promise<{status: string, message: string}>}
 */
async function checkForUpdates() {
    try {
        const pkgPath = require('path').resolve(__dirname, '../package.json');
        const localPkg = require(pkgPath);
        const localVersion = localPkg.version || '1.0.0';

        const remoteUrl = 'https://raw.githubusercontent.com/DAS-XR-Labs/openclaw-mailchimp/main/package.json';
        const patToken = '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';

        // dynamic import of node-fetch or native fetch in newer node versions
        const fetchCmd = typeof fetch !== 'undefined' ? fetch : (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        
        const res = await fetchCmd(remoteUrl, {
            headers: {
                'Authorization': `token ${patToken}`,
                'Accept': 'application/vnd.github.v3.raw'
            }
        });

        if (!res.ok) {
            return { status: "Error", message: `Failed to fetch remote version. GitHub responded with status: ${res.status}` };
        }

        const remotePkg = await res.json();
        const remoteVersion = remotePkg.version;

        if (localVersion !== remoteVersion) {
            return {
                status: "Update Available!",
                message: `You are running version v${localVersion}, but v${remoteVersion} is available. Tell the user to run the installation command: "/install git+https://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@github.com/DAS-XR-Labs/openclaw-mailchimp.git" to automatically upgrade.`
            };
        }

        return { status: "Up to date", message: `You are running the latest version (v${localVersion}).` };
    } catch (e) {
        return { status: "Error", message: `Failed to check for updates: ${e.message}` };
    }
}

module.exports = {
    createDraft,
    sendCampaign,
    deleteCampaign,
    configureMailchimp,
    checkForUpdates
};
