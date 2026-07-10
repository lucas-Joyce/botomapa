# STATE

kill_switch: OFF

## Protocol
- Every agent reads this file before acting.
- If kill_switch is ON, stop immediately. Do not edit, run, or commit.
  Report that the kill-switch is engaged and wait.
- Set to ON to halt all agents. Set to OFF to resume.

## Write lanes
- opencode: <fill in>
- aider: <fill in>
- claude: judge / escalation only, manual
