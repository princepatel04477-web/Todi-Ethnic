#!/bin/bash
# Upload product images to Supabase Storage
set -e
SUPABASE_URL="${SUPABASE_URL:-}"
SERVICE_KEY="${SUPABASE_SERVICE_KEY:-}"
if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_KEY" ]; then
  echo "Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars"
  exit 1
fi
STORAGE_URL="${SUPABASE_URL}/storage/v1/object/product-images"
AUTH="Authorization: Bearer ${SERVICE_KEY}"
upload_file() { curl -s -X POST "${STORAGE_URL}/$2" -H "$AUTH" -H "Content-Type: image/jpeg" --data-binary "@$1" -o /dev/null -w "HTTP %{http_code} $2\n"; }
for f in Bridal_Photos/*.jpeg; do base=$(basename "$f" | cut -d'_' -f1); upload_file "$f" "bridal/${base}.jpeg"; done
for f in Sider_Lengha/*.jpeg; do base=$(basename "$f" | cut -d'_' -f1); upload_file "$f" "sider/${base}.jpeg"; done
for f in Farsi_lengha/*.jpeg; do base=$(basename "$f" | cut -d'_' -f1); upload_file "$f" "farsi/${base}.jpeg"; done
upload_file "Indo_western.jpeg" "indo-western/Indo_western.jpeg"
echo "Done."
