# KairosAI Round 2 Demo v2

Open `index.html` in Chrome.

Two supported threats:
- Port Scan
- Network Spoofing (implemented as IP-MAC / ARP spoofing behavior)

Two input paths:
1. Controlled simulation buttons.
2. Custom log upload (.log, .txt, .csv).

The uploaded-log parser uses simple deterministic heuristics for the two supported threat classes.
This is a prototype for demonstration and validation, not a production IDS.

Sample logs are included in `/sample_logs`.
