# Build 93: bounded YouTube feed traversal and read-only safety

Unreleased v0.3.63. The feed/Shorts filter now stops before mutation if any object has more than 128 keys, the traversal exceeds 10,000 object-key edges, or a targeted array is sealed, frozen or not writable. All scheduled ad entry deletions are checked before committing; unknown structures remain unchanged. JSON fetched from the network is generally mutable, but page JavaScript may supply read-only objects or arrays. Those now fail open without stripping some entries from one branch before encountering a read-only branch. Tests include oversized objects, mixed writable/frozen arrays, sealed arrays and organic content.

No script downloads, Firefox permissions changes, Actions or release. Real browser tests remain outstanding.
