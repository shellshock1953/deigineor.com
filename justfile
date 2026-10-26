kube_libra := env_var_or_default("KUBECONFIG_LIBRA", env_var("HOME") + "/.kube/dnull/libra")
kube_ara := env_var_or_default("KUBECONFIG_ARA", env_var("HOME") + "/.kube/dnull/ara")

# Render deploy manifests and sanity-check the v2 site (local links, HTML parse)
check:
    kubectl kustomize v2/deploy > /dev/null
    python3 -c "$CHECK"

# Preview v2/site at http://localhost:8000
serve:
    python3 -m http.server -d v2/site 8000

# Show HTTP status of https://v2.deigineor.com and pods on libra
status:
    curl -sI https://v2.deigineor.com | head -1
    KUBECONFIG=~/.kube/dnull/libra kubectl -n deigineor get pods

# Print the initial admin password from the libra cluster
admin-password:
    KUBECONFIG=~/.kube/dnull/libra kubectl -n deigineor get secret deigineor-admin -o jsonpath='{.data.ADMIN_PASSWORD}' | base64 -d; echo

# Run the Next + Payload app in dev mode (needs Postgres, see v2/app/README.md)
app-dev:
    cd v2/app && pnpm dev

# Production build of the app
app-build:
    cd v2/app && pnpm build

# Import the real content into the app database (idempotent)
app-seed:
    cd v2/app && pnpm seed

# Lint, typecheck, test and build the app
app-check:
    cd v2/app && pnpm lint && pnpm typecheck && pnpm test && pnpm build

# Prove GlitchTip end to end: log in as admin, hit the selftest route (throws on purpose), list issues
error-check:
    #!/usr/bin/env bash
    set -euo pipefail
    k="kubectl --kubeconfig {{kube_libra}} -n deigineor"
    email=$($k get deploy deigineor -o jsonpath='{.spec.template.spec.containers[?(@.name=="web")].env[?(@.name=="ADMIN_EMAIL")].value}')
    password=$($k get secret deigineor-admin -o jsonpath='{.data.ADMIN_PASSWORD}' | base64 -d)
    tok=$(curl -s -X POST "https://v2.deigineor.com/api/users/login" \
      -H "content-type: application/json" \
      -d "{\"email\":\"$email\",\"password\":\"$password\"}" \
      | python3 -c "import json,sys; print(json.load(sys.stdin).get('token',''))")
    if [ -z "$tok" ]; then echo "  admin login failed"; exit 1; fi
    curl -s -o /dev/null -w "  selftest: %{http_code} (500 = threw as intended)\n" \
      -H "Authorization: JWT $tok" "https://v2.deigineor.com/api/selftest?t=$(date -u +%H%M%S)"
    echo "  waiting for GlitchTip to ingest..."
    sleep 20
    just issues

# Recent GlitchTip issues for the deigineor project
issues:
    #!/usr/bin/env bash
    set -euo pipefail
    # A read-only token kept next to GlitchTip on ara; 1Password is the fallback.
    t=$(kubectl --kubeconfig {{kube_ara}} -n glitchtip get secret agent-glitchtip-token \
        -o jsonpath='{.data.TOKEN}' 2>/dev/null | base64 -d 2>/dev/null || true)
    [ -n "$t" ] || t=$(op item get glitchtip-readonly-token --vault dnull --format json 2>/dev/null \
        | python3 -c "import json,sys; d=json.load(sys.stdin); print(next(f['value'] for f in d['fields'] if f.get('value') and f.get('label') in ('credential','password','token')))" 2>/dev/null || true)
    if [ -z "$t" ]; then
      echo "  cannot read a GlitchTip token (secret glitchtip/agent-glitchtip-token on ara, or 1Password)"
      echo "  or open https://glitchtip.ara.dnull.systems/dnull/issues?project=5"
      exit 0
    fi
    curl -s -H "Authorization: Bearer $t" \
      "https://glitchtip.ara.dnull.systems/api/0/organizations/dnull/issues/?query=is:unresolved&project=5&limit=100" \
      | python3 -c "
    import json,sys
    d=json.load(sys.stdin); d=d if isinstance(d,list) else d.get('results',[])
    rows=[i for i in d if (i.get('project') or {}).get('slug')=='deigineor']
    print(f'  {len(rows)} issue(s) in deigineor:')
    for i in rows[:10]:
        print(f\"    {i.get('shortId','?'):9} events={str(i.get('count')):4} {i.get('title','')[:62]}\")
    print('  https://glitchtip.ara.dnull.systems/dnull/issues?project=5')"

# Sync Grafana dashboard to monitoring namespace on ara
dashboard-sync:
    kubectl --kubeconfig {{kube_ara}} -n monitoring create configmap deigineor-dashboard \
      --from-file=deigineor.json=dashboards/deigineor.json \
      --dry-run=client -o yaml \
      | kubectl --kubeconfig {{kube_ara}} label --local -f - grafana_dashboard=1 -o yaml \
      | kubectl --kubeconfig {{kube_ara}} apply -f -
    @echo "synced -> https://grafana.ara.dnull.systems"

export CHECK := '''
import glob, os, sys
from html.parser import HTMLParser
bad = []
class P(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for k, v in attrs:
            if k in ("href", "src") and v and not v.startswith(("http:", "https:", "#", "mailto:", "data:")):
                p = v.split("#")[0].split("?")[0]
                f = os.path.join("v2/site", p.lstrip("/")) if p.startswith("/") else os.path.join("v2/site", p)
                if p and not os.path.exists(f):
                    bad.append(page + ": " + v)
for page in glob.glob("v2/site/*.html"):
    P().feed(open(page).read())
sys.exit("missing: " + ", ".join(bad)) if bad else print("ok")
'''

# Create a task (issue) and put it on the project board (users/shellshock1953/projects/2)
task-new title body="":
    #!/usr/bin/env bash
    set -euo pipefail
    url=$(gh issue create -R shellshock1953/deigineor.com -t "{{title}}" -b "{{body}}")
    # User projects are invisible to the GitHub App token; AGENT_GH_APP= makes the gh wrapper use the owner PAT.
    AGENT_GH_APP= gh project item-add 2 --owner shellshock1953 --url "$url" >/dev/null
    echo "$url"
