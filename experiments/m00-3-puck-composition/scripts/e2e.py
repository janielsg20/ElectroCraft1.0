from html.parser import HTMLParser
from pathlib import Path

root = Path(__file__).resolve().parents[1]
html = (root / "dist" / "poc-harness.html").read_text(encoding="utf-8")

class HarnessParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.statuses = []
        self.text = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if "data-status" in attrs:
            self.statuses.append(attrs["data-status"])
    def handle_data(self, data):
        self.text.append(data)

parser = HarnessParser()
parser.feed(html)
text = " ".join(parser.text)
for region in ["request", "result", "validation"]:
    if region not in parser.ids:
        raise RuntimeError(f"Falta región E2E: {region}")
for token in ["POC técnico", "Request", "Resultado", "Validación", "Puck.Components", "Puck.Outline", "Puck.Preview", "Puck.Fields", "Oferta editada"]:
    if token not in text:
        raise RuntimeError(f"E2E no encontró: {token}")
if parser.statuses != ["GREEN"]:
    raise RuntimeError(f"Estado E2E inesperado: {parser.statuses}")
print("PASS e2e-contract: fixture -> Puck mechanics -> canonical sync -> harness Request/Resultado/Validación GREEN.")
