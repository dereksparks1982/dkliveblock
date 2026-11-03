# Build 312: Nesty signal ingestion bound

November 3, 2026. Version 0.3.282, source-only on main.

The shared Nesty intelligence coordinator previously filtered every element of an input array before limiting its output to forty signals, allowing unnecessary work when noisy browser data arrived. The coordinator now scans at most 160 supplied signals and 160 catalog entries, emits at most forty unique whitelisted names in their first-seen order, and remains fully read-only. Tests cover large inputs, duplicate signals, unknown private-looking strings and absence of automatic ad rules. No site content, requests, media, user settings, permissions or geometry changed. Full Ubuntu and real-browser verification remain open.
