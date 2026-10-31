# Build 74: bundled MAIN-world JSON scriptlet

Version 0.3.44. Adds a static first-party YouTube player JSON handler (fetch .json()/.text(), XHR response and responseText) in the page's MAIN world, to supplement Build 73's Firefox network-response filtering. The script loads only on YouTube at document_start, and waits for a verified local content-controller enable event before hooking APIs. Disabling restores the original APIs when still owned by DK; no password, OAuth, private URLs, headers, response bodies or browsing activity are sent to the extension. No arbitrary downloaded JavaScript or GPL-licensed implementations were copied.

Activation may happen after some page bootstrap calls. Other scripts may wrap the same methods and site updates may defeat the approach. It is not proven against live YouTube, and it cannot guarantee that ad-funded film advertisements are removed. Full Ubuntu and Firefox acceptance is pending.
