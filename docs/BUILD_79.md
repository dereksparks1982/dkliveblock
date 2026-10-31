# Build 79: make YouTube response-filter opt-out real

Version 0.3.49. Corrected a Settings message omission that silently ignored the checkbox introduced in Build 73. Saving `youtubeResponseFilter:false` now persists the value and stops both response interception and narrow player-JSON request pass-through. Existing native filtering behavior resumes. Saving true restores the guarded response path. The background save already rebuilds the state and notifies tabs.

Added assertions to the existing source-level background integration fixture, and updated the 25-milestone master plan with honest in-progress implementation status. The page-context hook uses DOM messaging, not a secret security channel; hostile page scripts may attempt to tamper with their own execution world, so it must not be described as tamper-proof. Full Node/Python, Firefox and YouTube acceptance have not yet been performed.
