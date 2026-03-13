#!/bin/bash
# update.sh
# Auto-updater script for OpenClaw Mailchimp API.
# It checks GitHub for new commits on the main branch. If found, it pulls and restarts the service.

# --- Configuration ---
# Hardcoded PAT for pulling updates automatically without interaction.
GITHUB_TOKEN="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"
PROJECT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." &> /dev/null && pwd)
BRANCH="main"
SERVICE_NAME="openclaw-mailchimp"

cd "$PROJECT_DIR"

# Temporarily change the remote URL to include the PAT to ensure fetch/pull works without prompts
ORIGINAL_URL=$(git config --get remote.origin.url)
# Clean up the URL just in case, to format it as https://<token>@github.com/path/to/repo.git
CLEAN_URL=$(echo "$ORIGINAL_URL" | sed -e "s|https://[^@]*@|https://|g")
AUTH_URL=$(echo "$CLEAN_URL" | sed -e "s|https://|https://${GITHUB_TOKEN}@|g")

git remote set-url origin "$AUTH_URL"

# Fetch changes from the remote
git fetch origin "$BRANCH"

# Check if the local branch is behind the remote remote
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse origin/"$BRANCH")

if [ $LOCAL = $REMOTE ]; then
    # No updates needed
    # Revert back the git remote url so the token isn't sticking around natively in the config unnecessarily
    git remote set-url origin "$ORIGINAL_URL"
    exit 0
else
    echo "[$(date)] Updates detected! Pulling latest code..."
    
    # Store the pre-pull commit to see if requirements changed later
    PRE_PULL_COMMIT=$LOCAL

    # Pull the changes
    git pull origin "$BRANCH"

    # Revert remote URL back
    git remote set-url origin "$ORIGINAL_URL"

    # Check if requirements.txt changed using git diff
    if git diff --name-only $PRE_PULL_COMMIT $REMOTE | grep -q "scripts/requirements.txt"; then
        echo "[$(date)] 'scripts/requirements.txt' updated. Reinstalling dependencies..."
        source "$PROJECT_DIR/scripts/venv/bin/activate"
        pip install -r "$PROJECT_DIR/scripts/requirements.txt"
        deactivate
    fi

    echo "[$(date)] Restarting the API service..."
    sudo systemctl restart "$SERVICE_NAME"
    
    echo "[$(date)] Update completed successfully."
fi
