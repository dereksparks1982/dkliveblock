# DK Live Block: localhost manual QA lab

This test page contains fake ads, not real ad-network requests. It tests display hiding and restoration, never YouTube, Disney+, DRM, third-party downloads, or Adblock Plus parity.

When a local Firefox check is authorized, run python3 scripts/qa-lab.py inside a DK Live Block source checkout. The Python standard-library server binds only to 127.0.0.1:8765 and prints the lab URL. It does not automatically open a browser. End with Ctrl+C.

Checks: default ad markers should disappear; a dynamically inserted ad should disappear shortly after clicking its button. Open and nested Shadow DOM ad markers should also disappear. A closed Shadow DOM fixture should remain. A sponsored article, sign-in form, ad-labelled content nested inside a form/article, and video controls must remain usable. After pausing protection for 127.0.0.1, prior hidden slots should reappear. Resume, then repeat. Cookie reject/accept fixture buttons are recorded visibly, and no unintended acceptance should occur.

This is a convenience fixture only. Run the full local regression suite and all real Firefox, YouTube, Disney+, cookie-consent, login, popunder, performance, filter-update and license checks before approving release. Never publish private browsing logs.
