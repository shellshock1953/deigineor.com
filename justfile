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
    KUBECONFIG=~/.kube/dnull/libra kubectl -n deigineor-web get pods

# Run the Next + Payload app in dev mode (needs Postgres, see v2/app/README.md)
app-dev:
    cd v2/app && pnpm dev

# Production build of the app
app-build:
    cd v2/app && pnpm build

# Import the real content into the app database (idempotent)
app-seed:
    cd v2/app && pnpm seed

# Lint, typecheck and build the app
app-check:
    cd v2/app && pnpm lint && pnpm typecheck && pnpm build

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
