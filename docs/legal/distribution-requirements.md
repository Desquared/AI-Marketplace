# Distribution channels: legal and compliance requirements

> **Research, not legal advice.** This page records what each distribution
> channel's own terms, policies and submission docs require of a publisher
> before the `wave-cxm` plugin or the Wave CXM MCP server can be listed. It
> quotes or summarises the source and links it. Items marked **needs counsel**
> are for legal review. Nothing here has been reviewed by counsel.

- **Pages read:** 2026-11-25, live. Short quotes were taken from the page or
  from a fetch of it; check exact wording on the source before relying on it.
- **Subject:** the `wave-cxm` plugin in this repository (skills, two
  print-only hooks, and a `.mcp.json` naming two remote MCP servers:
  production `https://api.wavecxm.com/mcp`, read-only, and stage
  `https://stage.api.wavecxm.com/mcp`, read/write; both use user-delegated
  OAuth discovered from the 401 challenge; both closed-source), and the
  production MCP server listed on its own.
- **Status key:** **met** — the repository or listing already satisfies it;
  **missing** — Desquared must supply or change something; **needs counsel** —
  a legal judgement or a conflict between documents; **unverified** — could
  not be read on a live page; **decision** — a product or business choice.
- Terms change. Re-read a channel's terms on the day of submission.

## Contents

1. [Blockers and conflicts found](#blockers-and-conflicts-found)
2. [Desquared must provide](#desquared-must-provide)
3. Per channel:
   [Anthropic plugin](#anthropic-directory--plugin) ·
   [Anthropic connector](#anthropic-directory--mcp-connector) ·
   [OpenAI](#openai-plugin-directory) ·
   [awesome-copilot](#awesome-copilot) ·
   [copilot-plugins](#copilot-plugins) ·
   [Cursor](#cursor-marketplace) ·
   [Gemini CLI](#gemini-cli-extensions-gallery) ·
   [Kiro](#kiro-powers) ·
   [Official MCP Registry](#official-mcp-registry) ·
   [GitHub MCP Registry](#github-mcp-registry) ·
   [Cline](#cline-mcp-marketplace) ·
   [Smithery](#smithery) ·
   [mcp.so](#mcpso) ·
   [GitHub itself](#github-terms-of-service-public-repository)
4. [Fields for files another change owns](#fields-for-files-another-change-owns)
5. [Changes made in this repository](#changes-made-in-this-repository)

## Blockers and conflicts found

| # | Channel | Finding | Status |
|---|---|---|---|
| 1 | Cursor | The marketplace security help page says "All marketplace plugins must be open source." The Publisher Terms §3.3 only bars copyleft components. The plugin is under a proprietary licence. Ask Cursor whether a source-available licence qualifies before submitting. | needs counsel |
| 2 | Cursor | §3.1: the publisher "will not charge Users any fees, whether directly or indirectly, for access to or use of a Plugin through the Marketplace." Wave CXM is a paid service the plugin connects to. | needs counsel |
| 3 | Kiro | Power requirement: "Any MCP servers it uses are generally available, not in beta or preview." The stage endpoint is a pre-production environment. | decision |
| 4 | OpenAI | "only one MCP server can be connected per plugin"; final submission needs "A production HTTPS MCP server URL"; "Trial or demo plugins will not be accepted." Submit production only. | decision |
| 5 | Anthropic connector | Listing two URLs ("Multiple URLs") can be published "only once it has the Verified label". | decision |
| 6 | All MCP channels, Anthropic | Anthropic Policy 3F and the connector review criteria require the publisher to own or control the endpoints and that "The MCP server domain should match your service". OpenAI asks that public URLs "identify the same publisher as the submission". The listings are published by Desquared under the Wave CXM name on `wavecxm.com`. Document that Desquared owns the Wave CXM brand and domain, or publish under the entity that does. | needs counsel |
| 7 | Anthropic plugin | A plugin `name` or `author.name` that "matches a known brand" not owned by the submitter is held for review. Same root cause as #6. | needs counsel |
| 8 | Licence §4(4) vs channel terms | The licence bars using the Software to train AI models. GitHub ToS D.4 lets GitHub use repository content to train models; OpenAI's App Developer Terms §1.3 let OpenAI use App Requests and Responses to "improve our Services"; the MCP Registry dedicates metadata to CC0. The licence now carves out GitHub's rights explicitly (see [changes](#changes-made-in-this-repository)) and defers to accepted marketplace terms (Section 3). | needs counsel |
| 9 | Licence §8 vs channel terms | The licence is revocable "at any time". Kiro §1(f) requires supporting existing users for 90 days after removal; Cursor §7.3 lets existing installs keep working. | needs counsel |
| 10 | awesome-copilot | Automated gates require a root `plugin.json` in the Agent Plugins v1.0.0 format (`$schema` set, only `name, version, description, author, homepage, repository, license, keywords, extensions` at top level) and fail on anything else. The shared `plugin.json` declares `skills`, `hooks` and `mcpServers`. Format, not legal; listed because it blocks the channel. | decision |
| 11 | Gemini CLI | `gemini-extension.json` must be "in the absolute root of the repository or the release archive". This repository is a multi-plugin marketplace. Format, not legal. | decision |
| 12 | copilot-plugins | No public submission route: the repository is "now an ordinary, non-default marketplace" and every entry is GitHub- or Microsoft-owned. | unverified |
| 13 | Smithery | Smithery shut down its proxy, accounts, CLI and API on 2026-10-31 and is now a curated, non-proxied registry. `smithery.ai/new`, `/terms` and `/privacy` return 404. No self-serve listing route. | unverified |
| 14 | Official MCP Registry | Publishers must "Be at least 18 years old", and whoever runs `mcp-publisher` for Desquared "represent[s] and warrant[s]" authority to bind it. Metadata is dedicated to the public domain under CC0, "perpetual, irrevocable". | needs counsel |

## Desquared must provide

Placeholders in the repository are marked `[TO BE COMPLETED: …]`.

### URLs and contacts

- [ ] **Wave CXM privacy policy URL**, public, HTTPS. Required by Anthropic
      (both listings), OpenAI, Kiro (linked from the README) and Cursor
      (visible to all users). It must cover, at least: data categories
      collected, purposes, recipients, **retention periods**, user controls and
      deletion, and what the MCP servers log (OpenAI guidelines; Anthropic
      Policy 3A). It should also say that tool results pass to the user's AI
      client provider and are processed under that provider's terms (OpenAI
      §1.3). Placeholders: `LICENSE.md` §5, `plugins/wave-cxm/README.md`.
      Once it exists, also set `privacyPolicyUrl` in
      `plugins/wave-cxm/.claude-plugin/plugin.json` and the Codex
      `interface.privacyPolicyURL`.
- [ ] **Wave CXM terms of service URL**, public, HTTPS. Required by OpenAI and
      Cursor §4.2. Placeholders: `LICENSE.md` §5, `plugins/wave-cxm/README.md`.
- [ ] **Support contact** (address or URL), monitored. Required by Anthropic
      3B, OpenAI, Kiro README, Cursor §4.4. Placeholder:
      `plugins/wave-cxm/README.md` → Support.
- [ ] **Security contact address.** Anthropic Terms require "a mechanism for
      receiving reports of security vulnerabilities". Placeholder:
      `SECURITY.md`. Enable GitHub private vulnerability reporting on the
      repository as well.
- [ ] **Licensing contact address.** Placeholder: `LICENSE.md` → Contact.
- [ ] **Governing law and jurisdiction.** Placeholder: `LICENSE.md` §11.

### Decisions and legal review

- [ ] Counsel review of `LICENSE.md` (still marked DRAFT), including the three
      clarifications in this change.
- [ ] Brand and domain ownership: confirm that Desquared owns the Wave CXM name
      and logo and controls `wavecxm.com` and `go.wavecxm.com`, or list under
      the entity that does (#6, #7).
- [ ] Cursor: ask whether a proprietary, source-available plugin qualifies, and
      how §3.1 applies to a free plugin for a paid service (#1, #2).
- [ ] Stage endpoint: decide whether `https://stage.api.wavecxm.com/mcp` is
      public and generally available. It affects Kiro (#3), OpenAI (#4), the
      Anthropic connector (#5) and the MCP registries ("A remote server MUST be
      publicly accessible").
- [ ] Who signs: each channel's terms are accepted by the person submitting, on
      Desquared's behalf. Name an authorised signatory and keep a record of
      which terms (and version date) were accepted where.
- [ ] Indemnities and caps: Anthropic, OpenAI, Cursor and Kiro each require
      Desquared to indemnify them for claims about the plugin, with their own
      liability capped ($100 OpenAI and Cursor, $500 Kiro, none stated in
      Desquared's favour at Anthropic). Counsel to confirm acceptable.
- [ ] Sanctions and export representations: OpenAI §10.3, Cursor §4.2(c), Kiro
      §6(f) (OFAC, EU, UN lists, EAR, ITAR), MCP Registry (no ITAR data).
- [ ] Age: OpenAI requires an attestation that the plugin is suitable for
      under-18s and does not target under-13s; Anthropic's plugin form asks
      whether it is meant for under-18s; the MCP Registry requires the
      publisher to be 18+.
- [ ] Data-handling commitments to honour in the service, not only on paper:
      no extraneous conversation data, "even for logging purposes" (Anthropic
      1E); never read Claude memory or chat history (1G); no PCI data, no HIPAA
      PHI, no secrets (OpenAI §2.4); no training on plugin data or user content
      (Cursor §6.3); no selling plugin data (Cursor §4.7).
- [ ] Incident notification duties: Cursor §4.3 (`legal@cursor.com`,
      "promptly"), Kiro §1(d) ("immediately"), OpenAI §2.1 ("promptly"),
      Anthropic Terms (investigate reports). Add them to the incident runbook.

### Review material (not legal, but required to list)

- [ ] Reviewer test account with sample data, no MFA, not a real customer
      (Anthropic Verified review; OpenAI). Five positive and three negative test
      cases, a video walkthrough and release notes (OpenAI).
- [ ] Every MCP tool annotated with `title` and `readOnlyHint` /
      `destructiveHint` (Anthropic); `readOnlyHint`, `destructiveHint`,
      `openWorldHint` (OpenAI). Server-side change.
- [ ] OAuth: S256 PKCE; redirect `https://claude.ai/api/mcp/auth_callback` plus
      loopback redirects for Claude Code; DCR, CIMD or an Anthropic-held client
      (Anthropic authentication doc).
- [ ] Domain proofs: OpenAI challenge at
      `https://<host>/.well-known/openai-apps-challenge`; MCP Registry TXT
      record `v=MCPv1; k=ed25519; p=…` at the apex `wavecxm.com`, or
      `https://wavecxm.com/.well-known/mcp-registry-auth` (200, no redirects,
      reachable from Google Cloud addresses).
- [ ] Logos: Anthropic plugin square PNG 512–2048 px, under 2 MB, fixed at
      first save; Cline 400×400 PNG; Kiro SVG/EPS preferred, ≤5 MB; Anthropic
      connector icon (spec unverified).
- [ ] Public documentation page for the connector (Anthropic: "A blog post or
      help-center article is sufficient").
- [ ] OpenAI organisation identity verification (individual or business) in
      organisation settings.
- [ ] Notify each channel of material changes to tools, data practices or
      endpoints (Anthropic 3H; Cursor and Kiro review updates).

---

## Anthropic directory — plugin

Submitted at claude.ai/directory/manage → Plugin bundle, from the GitHub
repository with plugin path `plugins/wave-cxm`.

Governing documents (both Anthropic listings):
[Software Directory Policy](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy) (SDP),
[Software Directory Terms](https://support.claude.com/en/articles/13145338-anthropic-software-directory-terms) (SDT, updated 2026-03-16),
[Trademark Guidelines](https://www.anthropic.com/legal/trademark-guidelines).

| Requirement | Quote or summary | Source | Status |
|---|---|---|---|
| Licence | "Add a `LICENSE` file to the plugin folder, or set `license` in `plugin.json`". Blocking. Any licence type. | [Pre-submission checklist](https://claude.com/docs/plugins/pre-submission-checklist) | met |
| README | At least 40 words in the plugin folder; shown as the listing description. | checklist | met |
| Disclose behaviour | "Describe in the README everything the plugin runs, sends, or fetches". The scan fails undisclosed behaviour "such as sending data elsewhere, running hidden code". | checklist | met (README section added) |
| Privacy policy | SDP 3A: a "clear, accessible privacy policy link explaining data collection, usage, and retention" for software that connects to a remote service. SDT: "provide and adhere to a privacy policy". No own-domain rule. | SDP, SDT | missing |
| `privacyPolicyUrl` | `claude plugin validate` warns `PRIVACY_URL_MISSING`: a plugin that "connects to a remote MCP server or HTTP hook but declares no privacy policy URL (plugin.json `privacyPolicyUrl`, or a 'Privacy' link in README)". Not a hard failure. Set `privacyPolicyUrl` in `.claude-plugin/plugin.json` once the URL exists. | Claude Code CLI `plugin validate` directory checks (run 2026-11-25) | missing |
| Icon | The same checks warn `ICON_MISSING`: square PNG or JPEG, 512–2048 px, under 2 MB, at `.claude-plugin/icon.png` or via `icon`; SVG and WebP refused. The icon is taken "only once: the first time the plugin is saved or submitted". Add it before the first save. | same | missing |
| Terms of service URL | Not requested. | SDP, SDT, submit docs | met (n/a) |
| Data-handling questions | Form asks: personal data read or stored, other data destinations, retention, intended for under-18s. Four acknowledgements; their text is not published. | [Submit](https://claude.com/docs/plugins/submit) | missing (answers); acknowledgement text unverified |
| Remote MCP URLs | `type` `http` and absolute `https://` URLs; no credentials in files. | checklist | met |
| Hooks | Commands must reference paths only from `${CLAUDE_PLUGIN_ROOT}`; `node` scripts are held for review. This plugin's hooks are `printf` only. | checklist | met |
| Brand / name | A `name` or `author.name` that "matches a known brand" that isn't yours is held for review. Reserved words `claude`, `anthropic`, `official`, `plugin`, `mcp`, `test` cannot be the whole name. | checklist | needs counsel (#7) |
| Endpoint ownership | SDP 3F: own or control every endpoint and domain; plugins may instead point at a directory-approved connector. | SDP | needs counsel (#6) |
| Data limits | SDP 1E: collect only what tools need, no "extraneous conversation data, even for logging purposes". SDP 1G: no reading Claude memory or chat history; no profiles from conversations. | SDP | missing (service-side commitment) |
| Support and security | SDP 3B: "verified contact information and support channels for users with product or security concerns". SDT: a vulnerability-report mechanism. | SDP, SDT | missing (placeholders) |
| Docs and examples | SDP 3C documentation; 3E "at least three working examples of prompts or use cases". | SDP | met (README examples); review before submission |
| Maintenance | SDP 3G maintain; 3H notify material changes, "may be subject to re-review". | SDP | ongoing |
| Excluded uses | No ads, money transfers, AI image/video/audio generation. | SDP 4 | met |
| Licence to Anthropic | SDT: "non-exclusive, royalty-free, worldwide licenses to reproduce, display, and distribute any descriptions of the Software", and to display "your name, trademarks, logos". | SDT | met (licence §3, §6) |
| Warranties | SDT: you hold "all necessary rights", comply with law and the SDP, and information is "accurate and up-to-date". | SDT | needs counsel |
| Indemnity | SDT: "indemnify and hold Anthropic harmless from any claims, damages, or liabilities" related to the software. Anthropic may remove at any time; may change terms "without prior notice". | SDT | needs counsel |
| Anthropic marks | No use of Anthropic names or marks and no implied endorsement without written approval. | SDT, Trademark Guidelines | met (trademark notice added) |
| Model training, age, export | Not addressed beyond "comply with all applicable laws"; regions follow Anthropic's supported-countries list. | SDT, SDP 1A | met (n/a) |
| Who submits | Paid plan; on Team/Enterprise an Owner or a role with the Directory permission. First organisation to submit a folder holds the listing. | [Publish](https://claude.com/docs/directory/publish) | decision |

## Anthropic directory — MCP connector

Submitted at claude.ai/directory/manage → MCP connector. Same SDP and SDT as
above; Anthropic recommends submitting the server as a connector even when a
plugin references it, and pairing the two.

| Requirement | Quote or summary | Source | Status |
|---|---|---|---|
| Listing fields | Name, one-liner, description, categories, **documentation URL**, **privacy policy URL**, **support contact**, icon, permanent URL slug. | [Submission](https://claude.com/docs/connectors/building/submission) | missing (privacy, support, docs URL, icon) |
| Company step | "Company name and website, plus a primary contact for review updates." | submission | missing |
| Data handling | Own API, proxied with permission, or third party; health data; sponsored content. | submission | missing (answers) |
| Compliance | "Seven policy acknowledgments … All seven are required." | submission | missing (at submission) |
| First-party domain | "Your server must call your own first-party APIs … The MCP server domain should match your service." | [Review criteria](https://claude.com/docs/connectors/building/review-criteria) | needs counsel (#6) |
| Tool annotations | Every tool needs a `title` and `readOnlyHint` or `destructiveHint`; no catch-all read/write tool; names ≤ 64 characters. | review criteria | unverified (server is closed-source) |
| Authentication | 401 with `WWW-Authenticate: Bearer resource_metadata=…`; `resource` equals the MCP URL; S256 PKCE; redirect `https://claude.ai/api/mcp/auth_callback` and loopback redirects. | [Authentication](https://claude.com/docs/connectors/building/authentication) | unverified |
| Test account | "Don't put credentials in the portal." Requested by email for Verified review; "a test or sandbox account … not a real customer account". | submission; [Testing](https://claude.com/docs/connectors/building/testing) | missing |
| Public documentation | "required by your publish date. A blog post or help-center article is sufficient". | review criteria | missing |
| Multiple URLs | "can be published only once it has the Verified label". | submission | decision (#5) |
| Security | "Respond to security issues promptly". | submission | missing (contact placeholder) |
| Terms of service URL | Not a field. | submission | met (n/a) |
| Icon spec | Icon required; size and format not found. | submission | unverified |

## OpenAI plugin directory

Submitted at platform.openai.com as a ZIP archive. Reaches ChatGPT and Codex.
Sources: [Submission](https://developers.openai.com/plugins/deploy/submission),
[Plugin guidelines](https://developers.openai.com/plugins/plugin-guidelines),
[App Developer Terms](https://openai.com/policies/developer-apps-terms/) (updated 2026-09-28),
[Security and privacy guide](https://developers.openai.com/plugins/guides/security-privacy),
[Brand](https://openai.com/brand/).

| Requirement | Quote or summary | Source | Status |
|---|---|---|---|
| URLs | "Website, support, privacy policy, and terms URLs must use HTTPS and be at most 1,024 characters." Fields `interface.websiteURL`, `supportURL`, `privacyPolicyURL`, `termsOfServiceURL`. | submission | websiteURL met; others missing |
| Same publisher | "Public URLs must be accessible and identify the same publisher as the submission." | submission | needs counsel (#6) |
| Privacy policy content | "the categories of personal data collected, the purposes of use, the categories of recipients, data retention timelines, and any controls offered to your users." | guidelines | missing |
| Privacy notice before processing | §2.3: "a legally adequate privacy notice that is presented to the User prior to processing their data". | terms §2.3 | missing (consent screen should link the policy) |
| Data minimisation | No data beyond "what is reasonably necessary"; no reconstructing conversation histories; no undisclosed tracking, "including metadata collection such as timestamps, IP addresses, or query patterns". | guidelines | missing (service-side commitment) |
| Restricted data | No PCI data, no HIPAA PHI, no "Access credentials and authentication secrets". | guidelines; terms §2.4 | needs counsel (loyalty data may include personal data; no payment card data expected) |
| Retention | "Decide how long you keep user data and publish a retention policy." | security guide | missing |
| Support | "You must provide customer support contact details". | guidelines | missing |
| Vulnerabilities | §2.1: if you find vulnerabilities related to your API or an App Request, "promptly contact us". | terms §2.1 | ongoing |
| Identity | "All plugin submissions must come from verified individuals or organizations." | guidelines | missing |
| Attestations (six) | Agree to Terms and Guidelines; industry legal compliance; no money, crypto or trades; "all necessary rights to any third-party content or API endpoints"; "suitable for individuals under 18"; "does not target children under 13". | Dialog screenshot in submission doc (portal itself not read) | needs counsel |
| Region | Publish only where you intend availability; countries chosen at submission. | submission docs | decision |
| Export | §10.3: not in an embargoed country or on OFAC/BIS lists. | terms §10.3 | needs counsel |
| Model training | §1.3: OpenAI may use App Requests/Responses under its user terms, "which may include use of such content to provide, maintain, develop, and improve our Services". §1.6(f): no using App Requests to build competing models. | terms | needs counsel (#8); disclose in privacy policy |
| Marks | No implied OpenAI endorsement; no "GPT" in names; "Do not append 'MCP,' 'MCP Server,' or 'Plugin' to a company or product name." | guidelines; brand | met |
| Licence for publisher marks | §4.2: "non-exclusive, non-transferable, non-sublicensable … license to use the names, logos" to promote the app. | terms §4.2 | met (licence §6) |
| Licence to content | §1.3 licenses App Responses; no explicit clause for the plugin package itself. Covered by licence §3. | terms §1.3 | met |
| Warranties / indemnity | §1.4 compliance and rights; §6.1 indemnify OpenAI for the App, its responses, API and breach. OpenAI liability capped at $100. | terms | needs counsel |
| Law | California; NAM arbitration with 30-day opt-out. | terms §9, §10.4 | needs counsel |
| One server, production | See blocker #4. | submission | decision |
| Secrets | "Don't put the client secret in mcp.json"; nonempty server headers rejected. | submission | met |
| Review material | Demo account without MFA; five positive and three negative test cases; video; release notes; tool annotations. | submission | missing |

## awesome-copilot

External plugin submitted by an issue on `github/awesome-copilot`. Sources:
[CONTRIBUTING](https://github.com/github/awesome-copilot/blob/main/CONTRIBUTING.md),
[external-plugin issue form](https://github.com/github/awesome-copilot/blob/main/.github/ISSUE_TEMPLATE/external-plugin.yml),
[quality gates](https://github.com/github/awesome-copilot/blob/main/.github/scripts/external-plugins/external-plugin-quality-gates.mjs),
[discussion #968](https://github.com/github/awesome-copilot/discussions/968).

| Requirement | Quote or summary | Source | Status |
|---|---|---|---|
| Licence | A declared licence identifier is required; proprietary produces a warning, not a failure. | quality gates | met |
| Manifest format | Root `plugin.json` with `"$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json"` and only the v1.0.0 top-level fields; failures are blocking. | quality gates | missing (#10, format) |
| Pinned source | An immutable tag or full commit SHA. | issue form | missing (at submission) |
| Policies | Checkbox confirming the plugin follows their "contribution, security, and responsible AI policies". | issue form | needs counsel |
| Catalog entry licence | The repository is MIT and contributions are "licensed under the MIT License". Only the entry text (name, description, keywords) lands there, so treat it as public. | CONTRIBUTING | needs counsel (minor) |
| Commercial products | Allowed if the affiliation is clear; promotional text is declined. | discussion #968 | met |
| Review | Maintainer `/approve`; re-review every six months; listed as third party. | CONTRIBUTING | ongoing |
| Privacy, ToS, security contact, indemnity, age, export | None required. | above | met (n/a) |

## copilot-plugins

| Requirement | Quote or summary | Source | Status |
|---|---|---|---|
| Route | Previously "a second built-in default marketplace", now "an ordinary, non-default marketplace … that you register yourself". All entries are GitHub- or Microsoft-owned; CONTRIBUTING is a generic fork-and-PR template with no process for outside plugins. The catalog owner contact is a GitHub business address. | [CLI plugin reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference); [repository](https://github.com/github/copilot-plugins) | unverified (#12) |
| Legal requirements | None published. | — | unverified |

## Cursor Marketplace

Submitted at cursor.com/marketplace/publish with a repository link. Sources:
[Publisher Terms](https://cursor.com/marketplace-publisher-terms) (updated 2026-05-06),
[Plugin reference](https://cursor.com/docs/reference/plugins.md),
[Marketplace security](https://cursor.com/help/security-and-privacy/marketplace-security),
[Brand](https://cursor.com/brand).

| Requirement | Quote or summary | Source | Status |
|---|---|---|---|
| Open source | "All marketplace plugins must be open source." §3.3: no GPL, AGPL or LGPL components. | security help; terms §3.3 | needs counsel (#1) |
| Fees | §3.1: no fees "whether directly or indirectly" for the plugin through the Marketplace. | terms §3.1 | needs counsel (#2) |
| Terms and privacy visible | §4.2: the terms of service, privacy policy and disclosures must be "visible to, and accessible by, all Users". No own-domain rule. | terms §4.2 | missing (URLs) |
| Identity | §2.2: Cursor will "verify Publisher's identity and business legitimacy" and review the code; §2.3 provide source and docs on request. | terms §2 | missing (at submission) |
| Licence to Cursor | §3.2: "non-exclusive, worldwide, royalty-free, sublicensable, and transferable license to host, install, reproduce, perform, distribute, display, and promote your Plugin, including all associated listing content, descriptions, and trademarks". | terms §3.2 | met (licence §3, §6) |
| Licence to users | §3.3: "to install, access, and use", subject to disclosed terms. | terms §3.3 | met |
| Data | §4.7: no Plugin Data processing beyond the disclosed function; no selling or transfer. §6.1: appropriate security measures. | terms | missing (service-side commitment) |
| Model training | §6.3: "will not use Plugin Data or User Content to train any artificial intelligence or machine learning models." | terms §6.3 | missing (service-side commitment) |
| Support | §4.4: publisher "solely responsible for providing technical support". | terms §4.4 | missing (contact) |
| Security incidents | §4.3: notify `legal@cursor.com` of any vulnerability, breach or incident, promptly. | terms §4.3 | ongoing |
| Accuracy | §4.5: no "false or unsubstantiated claims". | terms §4.5 | met |
| Cursor marks | §4.6: say "Cursor", never "Cursor AI". | terms §4.6 | met |
| Export | §4.2(c): export-control and sanctions compliance. | terms | needs counsel |
| Indemnity | §8.1 broad indemnity, including "any security vulnerability, data breach"; Cursor liability capped at $100. | terms §8, §10 | needs counsel |
| Law | California; AAA arbitration; San Francisco courts. | terms §11–12 | needs counsel |
| Manifest | `name` required; optional `description, version, author, homepage, repository, license, keywords, logo`; README documents usage. | plugin reference | met (homepage added); Cursor manifest owned by another change |
| Form fields | Beyond the repository link, behind sign-in. | publish page | unverified |

## Gemini CLI extensions gallery

No submission: a public repository with the `gemini-cli-extension` topic and a
release is crawled daily. Sources:
[Releasing](https://geminicli.com/docs/extensions/releasing/),
[Reference](https://geminicli.com/docs/extensions/reference/),
[Gallery](https://geminicli.com/extensions/),
[Terms and privacy](https://geminicli.com/docs/resources/tos-privacy/).

| Requirement | Quote or summary | Source | Status |
|---|---|---|---|
| Manifest location | `gemini-extension.json` "in the absolute root of the repository or the release archive". | releasing | decision (#11) |
| Licence | Not required; the gallery shows a licence badge. Display of a custom licence unverified. | gallery | met |
| Disclaimer | "Google does not vet, endorse, or guarantee the functionality or security of these extensions." | gallery | met (n/a) |
| Publisher terms | None found; the Gemini CLI terms bind users. | terms page | unverified |
| Privacy, support, identity, age, export, training | None required of publishers. | above | met (n/a) |

## Kiro powers

Submitted at kiro.dev/powers/submit with a public GitHub repository URL.
Sources: [Submit form](https://kiro.dev/powers/submit/),
[Registry Publisher Terms](https://kiro.dev/registry/terms/) (updated 2026-11-09).

| Requirement | Quote or summary | Source | Status |
|---|---|---|---|
| Repository link | "Publish it in a public GitHub repository, then submit the link below." | submit | met |
| Form | First and last name, email, use case (3–4 words), repository URL required; organisation and logo optional. Submitting accepts the Publisher Terms and the AWS Privacy Notice; no checkboxes. | submit | missing (at submission) |
| README privacy link | "The repository README includes: Privacy Policy (link)". | submit | missing (placeholder in README) |
| README support | "Support contact info (link or email)". | submit | missing (placeholder in README) |
| GA servers | "Any MCP servers it uses are generally available, not in beta or preview". | submit | decision (#3) |
| Manifest | `plugin.json` with `$schema`, `name`, `version`, `description`, `author` (name required), `keywords`, `license` (SPDX format recommended). `LicenseRef-Desquared-Proprietary` is a valid SPDX `LicenseRef`. | submit | license met; `$schema` owned by another change |
| User terms | §1(b): without stated terms, users get a licence "to access, download, modify, and otherwise use your Submission". The repository licence states Desquared's terms. | terms §1(b) | met |
| Privacy and consent | §1(d): "legally adequate privacy notices" and consent; AWS may collect usage metrics from use of submissions. | terms §1(d) | missing (privacy URL) |
| Licence to AWS | §1(e): "nonexclusive, royalty-free, sublicensable, transferable, worldwide license" to distribute, and to use "your name, logos, and Submissions" in marketing. | terms §1(e) | met (licence §3, §6) |
| Vulnerabilities | §1(d): "immediately notify us" and remedy. | terms §1(d) | ongoing |
| Post-removal support | §1(f): support existing users for at least 90 days after removal. | terms §1(f) | needs counsel (#9) |
| Identity | §1(d) may require identity verification; §2(a) authority to bind. | terms | missing (signatory) |
| AWS policies | §1(c): AWS Acceptable Use Policy and Responsible AI Policy. Not read. | terms §1(c) | unverified |
| Sanctions | §6(f): EAR, ITAR, OFAC; not on UN, US or EU lists. | terms §6(f) | needs counsel |
| Indemnity and law | §3 broad indemnity; AWS cap $500; Washington law, King County courts. | terms §3–6 | needs counsel |
| Kiro marks | No trademark section; brand guidelines not found. | terms | unverified |

## Official MCP Registry

Published with `mcp-publisher publish` as `com.wavecxm/mcp`. Sources:
[Terms of Service](https://modelcontextprotocol.io/registry/terms-of-service) (effective 2025-09-02),
[Authentication](https://modelcontextprotocol.io/registry/authentication),
[Remote servers](https://modelcontextprotocol.io/registry/remote-servers),
[Moderation](https://modelcontextprotocol.io/registry/moderation-policy),
[server.json schema](https://raw.githubusercontent.com/modelcontextprotocol/registry/main/docs/reference/server-json/draft/server.schema.json).

| Requirement | Quote or summary | Source | Status |
|---|---|---|---|
| Age | "you must: 1. Be at least 18 years old." | ToS | needs counsel (#14) |
| Authority | Acting for an entity, "you represent and warrant that you have authority to bind that entity". | ToS | missing (signatory) |
| Metadata licence | Metadata "will be dedicated to the public domain under CC0 1.0 Universal … perpetual, irrevocable, and worldwide", with a moral-rights waiver. Applies to metadata only, not the server. | ToS | met (licence §5) |
| Publisher data | Published metadata may include personal data; publishers waive access, erasure and objection rights over it. | ToS | needs counsel |
| Export | Lawful use incl. import/export laws; no ITAR-controlled data. | ToS | needs counsel |
| Branding | No falsely implying affiliation; "Official MCP Registry" only where it does not imply endorsement. | ToS | met |
| Namespace proof | TXT `v=MCPv1; k=ed25519; p=<PUBLIC_KEY>` at the apex `wavecxm.com`, or `https://wavecxm.com/.well-known/mcp-registry-auth` returning 200 with no redirects. | authentication | missing |
| Public reachability | "A remote server MUST be publicly accessible at its specified URL." | remote servers | decision (stage) |
| Permanence | "Server metadata is never permanently removed"; versions are immutable. | FAQ | needs counsel (minor) |
| Fields | Required `name`, `description` (≤ 100 characters), `version`; optional `websiteUrl`, `repository`, `title`, `icons`. No privacy, licence or support field. | schema | owned by another change |
| Training, indemnity, privacy URL | None. | ToS | met (n/a) |

## GitHub MCP Registry

| Requirement | Quote or summary | Source | Status |
|---|---|---|---|
| Route | After an official MCP Registry listing, "email partnerships@github.com and request for your server to be included". Selection criteria not published. | [GitHub blog](https://github.blog/ai-and-ml/generative-ai/how-to-find-install-and-manage-mcp-servers-with-the-github-mcp-registry/) | unverified (criteria) |
| Inherited | Everything under the Official MCP Registry. | — | see above |

## Cline MCP Marketplace

Issue on `cline/mcp-marketplace`. Sources:
[README](https://github.com/cline/mcp-marketplace/blob/main/README.md),
[submission form](https://github.com/cline/mcp-marketplace/blob/main/.github/ISSUE_TEMPLATE/mcp-server-submission.yml),
[Cline terms](https://cline.bot/tos).

| Requirement | Quote or summary | Source | Status |
|---|---|---|---|
| Repository | "GitHub Repository URL" required. Install has Cline "autonomously handle cloning, setup, and configuration". This repository can serve as the link; whether a remote-only server with a docs-only install path is accepted is not stated. | form; README | unverified |
| Logo | 400×400 PNG, required. | form | missing |
| Attestations | Tested that Cline can install it from README/`llms-install.md`; "The server is stable and ready for public use". | form | missing (at submission) |
| Identity | "We verify the identity and reputation of maintainers", with more scrutiny in sensitive domains. | README | missing (at submission) |
| Licence, privacy, security contact | None required. | README | met (n/a) |
| Cline user terms | Cline's terms (Delaware law; model providers may train on content unless opted out) bind Cline users; whether they bind listing submitters is not stated. | Cline terms | unverified |

## Smithery

| Requirement | Quote or summary | Source | Status |
|---|---|---|---|
| Service | "On October 31, 2026, we're shutting down Smithery's connection management services. Smithery will remain as a public (non-proxied) MCP registry"; "A curated set of verified servers". Smithery no longer proxies traffic. | [smithery.ai/future](https://smithery.ai/future) | unverified (#13) |
| Submission and terms | `/new`, `/terms` and `/privacy` return 404; the footer privacy link goes to the operator's parent company. No listing route or publisher terms found. | — | unverified |

## mcp.so

| Requirement | Quote or summary | Source | Status |
|---|---|---|---|
| Form | "Repository URL" required; a "Remote Server" tab exists (its fields not readable). | [Submit](https://mcp.so/submit) | unverified (remote tab) |
| Paid tier | "one-time $39 fee: it is published immediately without review". | submit | decision |
| Terms | Generic terms dated 2026-07-01; no named operator, no governing law, no licence over submissions, no training clause. | [Terms](https://mcp.so/terms-of-service) | needs counsel (unknown counterparty) |
| Privacy | "We do not sell your personal information." | [Privacy](https://mcp.so/privacy-policy) | met (n/a) |
| Verification, privacy URL, security contact | None required. | above | met (n/a) |

## GitHub Terms of Service (public repository)

Every plugin channel reads this public repository, so GitHub's terms apply to
it regardless of the licence. Source:
[GitHub Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service).

| Clause | Quote or summary | Status |
|---|---|---|
| D.5 | "By making a repository public, you grant other Users a nonexclusive, worldwide license to use, display, perform and reproduce (by forking) Your Content through the Service". | met (licence §4 now carves this out) |
| D.4 | GitHub may use repository content "for the purpose of training, developing, and improving artificial intelligence and machine learning models". | needs counsel (#8) |
| D.6 | Contributions are licensed under the repository's licence unless an agreement says otherwise. | needs counsel (consider a contributor agreement or a no-outside-contributions note) |

## Fields for files another change owns

Channel manifests and listing files are being added in a separate change. These
legal and compliance fields belong in them:

| File | Field | Value |
|---|---|---|
| `plugins/wave-cxm/.codex-plugin/plugin.json` | `interface.privacyPolicyURL` | Wave CXM privacy policy URL (to be supplied) |
| same | `interface.termsOfServiceURL` | Wave CXM terms URL (to be supplied) |
| same | `interface.supportURL` | Support URL (to be supplied) |
| `plugins/wave-cxm/.cursor-plugin/plugin.json` | `license`, `homepage`, `author` | `LicenseRef-Desquared-Proprietary`, `https://go.wavecxm.com`, `Desquared` |
| Kiro power `plugin.json` | `license`, `author`, `$schema` | `LicenseRef-Desquared-Proprietary`, Desquared; README must link privacy policy and support |
| Agent Plugins v1.0.0 `plugin.json` (awesome-copilot) | `license`, `homepage`, `author` | as above |
| `gemini-extension.json` | — | No legal fields; ship `LICENSE.md` beside it |
| `server.json` (MCP Registry) | `websiteUrl` | A page on the Wave CXM site that links the privacy policy, terms and support contact |
| same | `name`, `description` | `com.wavecxm/mcp`; description ≤ 100 characters, no implied endorsement |
| same | `repository` | Optional; omit or point to this repository |

## Changes made in this repository

- `LICENSE.md` (and its byte-identical copy in `plugins/wave-cxm/`), still
  DRAFT:
  - §4: adds to the list of acts that are not a breach "anything GitHub, or
    another user of GitHub, may do with this public repository under GitHub's
    Terms of Service", because GitHub ToS D.4 and D.5 grant those rights
    whatever the licence says.
  - §5: adds the Wave CXM terms of service and privacy policy, as placeholders,
    because Cursor §4.2 and Kiro §1(d) require them to be visible to users.
  - §6: lets a Marketplace display the names and logos Desquared supplies with
    a listing, because Anthropic's Terms, Cursor §3.2 and §3.4, Kiro §1(e) and
    OpenAI §4.2 take that right and §6 previously denied it.
- `plugins/wave-cxm/README.md`: "What the plugin runs, sends and fetches"
  (Anthropic checklist), "Privacy and data" and "Support" with placeholders
  (Kiro, Anthropic, OpenAI, Cursor), and a third-party trademark notice.
- `README.md`: trademark notice and a pointer to each plugin's privacy section.
- `SECURITY.md`: says Desquared also notifies affected marketplaces, matching
  the notification duties in Cursor §4.3, Kiro §1(d) and OpenAI §2.1.
- Plugin manifests: `homepage` `https://go.wavecxm.com` in the three
  manifests, and `interface.websiteURL` in the Codex manifest (OpenAI requires
  a website URL; Cursor and Agent Plugins accept `homepage`).
