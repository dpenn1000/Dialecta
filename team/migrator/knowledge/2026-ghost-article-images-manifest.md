# Manifest: article feature images downloaded from Ghost, 2026-09-21

Five files, all under `_migration/ghost-images/content/images/2026/04/` (repo-relative from
`C:\Dialecta\`). `_migration/` is gitignored; these bytes are local to this machine only until the
plan's upload step runs. All five verified by a second, independent `sha256sum` pass after writing
this table (see "Verification" below), not just at download time.

Every row was fetched from the `_o` path (Ghost's original-preservation suffix). For three of five
that path is byte-identical to the plain serving path; for two it differs and the difference is
still being chased (see the inventory doc, section 3, "Caveat"). The "original relationship"
column states which case each row is.

| # | Local path (under `ghost-images/`) | Source URL fetched | bytes | sha256 | content type | pixel dimensions | Article (slug / ghost_post_id) | Original relationship |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `content/images/2026/04/v855sq14xoazk8EBm4D6o9WUjoc3qMMtQLZ2u6nBw-iLLwOVbYT_X5UiefLJW7RP-hQOojPn8GpLXnjayqxFCRzY9Bx9U2xaPDMBEcUkvpdD57Qdk6c_M6vMCxG2-wQ_5zN5Ti7_gQjZ9G-oecaVdr5udjGNixitmnrtwAfutTcoPAFoF_LRau7EDzfDtT0O_o.jpg` | `https://www.dialecta.org/content/images/2026/04/v855sq14xoazk8EBm4D6o9WUjoc3qMMtQLZ2u6nBw-iLLwOVbYT_X5UiefLJW7RP-hQOojPn8GpLXnjayqxFCRzY9Bx9U2xaPDMBEcUkvpdD57Qdk6c_M6vMCxG2-wQ_5zN5Ti7_gQjZ9G-oecaVdr5udjGNixitmnrtwAfutTcoPAFoF_LRau7EDzfDtT0O_o.jpg` | 150,650 | `32c2e2a429f2671b05d1b1b05dabfae79325bd03336eeede1e3f977cb09c6f29` | image/jpeg | 2048x1365 | `_o` confirmed larger than the bare path (129,564 bytes); checked stable twice, minutes apart |
| 2 | `content/images/2026/04/ChatGPT-Image-Apr-27--2026--04_20_31-PM_o.png` | `https://www.dialecta.org/content/images/2026/04/ChatGPT-Image-Apr-27--2026--04_20_31-PM_o.png` | 1,896,067 | `bac009c7e4126132d03b3b1744b9de0645bc3c0cccdf6b561941fa528987dd72` | image/png | 1536x1024 | `_o` byte-identical to the bare path, both checked |
| 3 | `content/images/2026/04/9315c5f3-932a-4ee2-b802-5e5eacdf31f1_o.png` | `https://www.dialecta.org/content/images/2026/04/9315c5f3-932a-4ee2-b802-5e5eacdf31f1_o.png` | 2,216,055 | `ed467bb4e4dd98db09a988a60d419703c2de6262579fb061986d647a1c13d139` | image/png | 1536x1024 | `_o` byte-identical to the bare path, both checked |
| 4 | `content/images/2026/04/3f252122-0cf9-45cf-82e4-f3a34b454df4_o.png` | `https://www.dialecta.org/content/images/2026/04/3f252122-0cf9-45cf-82e4-f3a34b454df4_o.png` | 2,083,150 | `e8ab6e02c3368e412457f98546906a520ec97f4d7ccf3bda9ffdada070b15e78` | image/png | 1536x1024 | Unstable: first check saw 2,289,067 bytes at `_o`; the download and a follow-up check both settled at 2,083,150, matching the bare path. Not re-chased. See inventory doc |
| 5 | `content/images/2026/04/RyRy_o.png` | `https://www.dialecta.org/content/images/2026/04/RyRy_o.png` | 2,038,175 | `03f6c6da66d67f785d79dc5edc9efeff84048bdaa7f9d817c435eee50766dc15` | image/png | 1536x1024 | Unstable: first check saw 2,213,269 bytes at `_o`; a check taken immediately before download and the download itself both settled at 2,038,175, matching the bare path. Not re-chased. See inventory doc |

Total: 8,384,097 bytes, about 8.0 MiB.

## Article reference

| Article slug | ghost_post_id | Manifest row |
| --- | --- | --- |
| on-the-far-shore-of-fear | `69eff72be5eec200010d5310` | 1 |
| on-doubt-and-devotion-when-faith-pauses | `69efc475e5eec200010d5299` | 2 |
| the-conversation-communities-keep-having-about-solar-and-what-the-evidence-actually-says | `69d5c5c083cd72000193f0cd` | 3 |
| the-moment-you-stop-waiting-for-your-life-to-start | `69f2937b4e51770001fb5218` | 4 |
| knowledge-without-borders-why-education-must-be-free | `69f2594b4e51770001fb51d7` | 5 |

Each article has exactly one image in this manifest; none of the five carries an inline body
image (confirmed in the inventory doc, section 1).

## Verification

`sha256sum` was run twice against the five files in `_migration/ghost-images/content/images/2026/04/`,
once immediately after download and once while writing this table, both from the same local files
with nothing re-fetched in between. Both passes agree with the table above. Pixel dimensions read
with .NET's `System.Drawing.Image` (PowerShell, `Add-Type -AssemblyName System.Drawing`), which
opens each file locally and costs nothing over the network. Content type is what the server sent as
`Content-Type` on the successful download, not guessed from the extension.
