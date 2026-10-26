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
