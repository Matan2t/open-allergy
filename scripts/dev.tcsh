#!/bin/tcsh -f
# Force-restart the local Astro dev server for Open Allergy Cards.
# Usage: ./scripts/dev.tcsh
#        (or: tcsh scripts/dev.tcsh)

cd "`dirname $0`/.."
setenv ASTRO_TELEMETRY_DISABLED 1
exec pnpm exec astro dev --force
