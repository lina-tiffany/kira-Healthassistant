#!/bin/sh
set -eu

BASE_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

cd "$BASE_DIR"

"$BASE_DIR/.venv/bin/python" manage.py run_notification_reminders
