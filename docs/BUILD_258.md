# Build 258 · v0.3.228: numbered Agent Nesty specialists

## Owner-approved naming
Use **Agent Nesty** (singular brand). Assign stable machine IDs and user-visible names to each specialized event-driven watcher:

| ID | Display name | Trigger | State |
| --- | --- | --- | --- |
| `agent_nesty_1` | Agent Nesty 1 | HTTP `Set-Cookie` response header | Armed when request observation is enabled |
| `agent_nesty_2` | Agent Nesty 2 | Firefox cookie-change event | Standby: browser hook not implemented |
| `agent_nesty_3` | Agent Nesty 3 | JavaScript cookie-write event | Standby: script hook not implemented |

This change updates the registry in `src/cookie-sentinels.js`, runtime variables, extension-only message actions, Cookie Watch header/status, and the Site Dashboard link. The viewer reads IDs and names directly from the registry so the numbering cannot drift between files. No claims of affiliation with the person the owner named the system after.

**Behaviors preserved:** No new permissions, blocking rules, cookie deletion, background polling, non-cookie traffic changes, additional active agents, or approved UI geometry changes. Agent Nesty 1 is still passive and value-free. Existing YouTube and streaming logic untouched.

**Validation:** JavaScript syntax checks for the modified modules, registry wake/status smoke check, and value-redaction check passed. Node regression test committed but full Node/Firefox testing was not performed. Existing Facebook acceptance remains pending.
