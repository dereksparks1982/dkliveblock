# DK Live Block Build 32: My Downloads

**Version 0.3.3, UNRELEASED internal source.**

This build adds a user-triggered, read-only video download inventory in the Firefox extension. It lists sanitized local filenames, sizes and modified times from DK's fixed Linux Downloads folder, with no file content reading, execution, uploading or deleting. Only known media formats are displayed; hidden, partial and symlinked entries are excluded. Results are bounded to 150 files and scans to 3000 entries.

The companion only accepts the fixed `listDownloads` action and does not accept arbitrary paths supplied through browser messages. Ordinary blocking and local Save for Later still require no companion. The Linux companion script and one-file installer source include the new module, and offline tests are added.

**Still pending:** full regression suite, actual Linux Firefox native-messaging and local file inventory, test of YouTube download results, YouTube preroll/midroll and Disney+ playback, ABP parity, signing and user-authorized release.
