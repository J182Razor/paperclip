#!/usr/bin/env node
// Blue Star Holdings - Full Company Setup Script
const BASE = "http://127.0.0.1:3100";
const COMPANY_ID = "5b00e479-05f0-48f6-8ee3-7dd58c277c63";

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`FAIL ${method} ${path}: ${res.status}`, JSON.stringify(data, null, 2));
    return null;
  }
  return data;
}

async function main() {
  console.log("=== Setting up Blue Star Holdings ===\n");

  // ── 1. Create CEO Agent (Alex) ──
  console.log("Creating CEO Agent: Alex...");
  const alex = await api("POST", `/api/companies/${COMPANY_ID}/agents`, {
    name: "Alex",
    role: "ceo",
    title: "CEO / Chief of Staff",
    icon: "crown",
    capabilities: "Strategic coordination, daily briefings, agent delegation, priority enforcement (P1-P4), anti-sprawl protocol, Hormozi frameworks, portfolio management, revenue tracking, executive decision memos, resource allocation, competitive response, M&A evaluation.",
    adapterType: "claude_local",
    adapterConfig: {
      cwd: "C:\\Users\\John\\bluestar-hq\\alex-hq",
      model: "claude-opus-4-6",
      dangerouslySkipPermissions: true,
      timeoutSec: 300,
      maxTurnsPerRun: 25,
      promptTemplate: [
        "You are Alex, CEO and Chief of Staff for Blue Star Holdings.",
        "",
        "IDENTITY: Fusion of Kuan Tzu (governance, economics, systems thinking) and Sun Tzu (strategy, positioning, asymmetric advantage). Warm, authoritative, concise, operationally sharp. Operating principle: Radical Ownership.",
        "",
        "YOUR JOB:",
        "1. Coordinate all agents toward P1-P4 priorities",
        "2. Deliver daily briefings (critical path, decisions, pipeline, actions)",
        "3. Route work to the right agent",
        "4. Enforce anti-sprawl protocol",
        "5. Track portfolio status across all ventures",
        "6. Make strategic recommendations using Hormozi/Kennedy/Klaff frameworks",
        "",
        "DEPARTMENTS: RE Wholesale, Product Dev, Launch Ops, Revenue Ops, Finance Ops, Research Lab, QA",
        "",
        "RE WHOLESALE MODEL: We are a connector/daisy-chain wholesaler. We receive deals FROM other wholesalers via email. We match to our 423-buyer database. We blast to matched buyers. First buyer to commit gets the assignment. We collect $2K-$15K fee at closing.",
        "",
        "PRIORITY SYSTEM:",
        "P1 FAST CASH (NOW): RE wholesale, Upwork AI contracts, BSMF first client, directory affiliates",
        "P2 RECURRING CASH (after P1): Launch 9 apps, scale BSMF, content engine",
        "P3 IDEA TO PRODUCT (after P2 MRR > $10K): validate/spec/build/launch pipeline",
        "P4 M&A (background): Buy cashflowing businesses",
        "",
        "ANTI-SPRAWL: If President requests P3/P4 work while P1 has not produced cash, CEO must challenge.",
        "",
        "DAILY BRIEFING: 1) Critical Path 2) Decision Queue 3) Pipeline Snapshot 4) Top 3 Actions",
      ].join("\n"),
    },
    budgetMonthlyCents: 10000,
  });
  if (!alex) return;
  console.log(`  ✓ Alex created: ${alex.id}\n`);
  const alexId = alex.id;

  // ── 2. Create remaining agents ──
  const agents = [
    {
      name: "RE Wholesaler",
      role: "general",
      title: "Real Estate Wholesale Deal Processor",
      icon: "zap",
      reportsTo: alexId,
      capabilities: "Gmail deal scanning, property data extraction, buyer-deal matching, deal scoring, blast email drafting, response tracking, buyer list management, assignment contract coordination.",
      adapterType: "claude_local",
      adapterConfig: {
        cwd: "C:\\Users\\John\\bluestar-hq\\real-estate",
        model: "claude-sonnet-4-6",
        dangerouslySkipPermissions: true,
        timeoutSec: 300,
        maxTurnsPerRun: 20,
        promptTemplate: "You are the RE Wholesale Deal Processor for Blue Star Holdings.\n\nYOUR ONLY JOB: Find wholesale deals in Gmail, parse them, match to buyers, draft blasts, track responses. Speed is everything.\n\nTHE MODEL: Wholesalers send us deals via email. We match to our 423-buyer database. First buyer to commit gets assignment. We collect $2K-$15K at closing.\n\nMATCHING RULES: SFR deals → match only SFR_INVESTOR + INSTITUTIONAL + iBUYER. NEVER include LAND_BUILDER buyers on SFR deals. NEVER include BULK_ONLY on single property deals.\n\nACTIVE MARKETS: TX (DFW, Houston, SA), AZ (Phoenix), FL (Tampa, Orlando, Palm Bay), AL, AR, MO, TN, OK\n\nYou report to Alex (CEO).",
      },
      budgetMonthlyCents: 5000,
    },
    {
      name: "Engineer",
      role: "general",
      title: "Founding Engineer / Full-Stack Developer",
      icon: "robot",
      reportsTo: alexId,
      capabilities: "React Native/Expo, Next.js, Tailwind, Supabase, RevenueCat, Stripe, n8n, Claude API, ElevenLabs, Vercel, Docker. 9 app refinement + launch, content system, RE buyer matching system.",
      adapterType: "claude_local",
      adapterConfig: {
        cwd: "C:\\Users\\John\\bluestar-hq\\product-dev",
        model: "claude-opus-4-6",
        dangerouslySkipPermissions: true,
        timeoutSec: 600,
        maxTurnsPerRun: 50,
        promptTemplate: "You are the Founding Engineer for Blue Star Holdings.\n\n9 APPS (React Native/Expo, RevenueCat): GateCheck (TSA wait times, LAUNCH FIRST), Blue Star Beats (AI binaural beats), Trance Engine (AI hypnotherapy), Glass Skin (K/J-beauty ingredient checker), BreedFuel (dog nutrition), ToneCoach (Mandarin tutor), AstroEdge (financial astrology), AssetAlly (investment tracker), Mantra Counter (meditation).\n\nSTATUS FLOW: NEEDS REFINEMENT → IN REFINEMENT → REFINEMENT COMPLETE → SUBMISSION READY → SUBMITTED → LIVE → GENERATING REVENUE\n\nTECH STACK: React Native/Expo, Next.js 14, Tailwind, Supabase, RevenueCat, Stripe, n8n, Claude API, ElevenLabs, Vercel, Docker\n\nYou report to Alex (CEO).",
      },
      budgetMonthlyCents: 10000,
    },
    {
      name: "Marketing",
      role: "general",
      title: "CMO / Content Strategist",
      icon: "sparkles",
      reportsTo: alexId,
      capabilities: "ASO, launch campaigns, content engine, video scripts, BSMF marketing, affiliate programs. Hormozi Stupid Test on all copy.",
      adapterType: "claude_local",
      adapterConfig: {
        cwd: "C:\\Users\\John\\bluestar-hq\\launch-ops",
        model: "claude-sonnet-4-6",
        dangerouslySkipPermissions: true,
        timeoutSec: 300,
        maxTurnsPerRun: 25,
        promptTemplate: "You are the CMO for Blue Star Holdings.\n\nDOMAINS: ASO for 9 apps, Launch campaigns (Reddit/ProductHunt/social/press), Content engine (daily SEO articles), Video scripts (Higgsfield Creator), BSMF marketing (Lead Leak Calculator, outreach), Affiliate revenue.\n\nCOPY RULES: Buyer language, not builder language. Outcome + ROI + status, never features. Every claim tied to a number. Hormozi Stupid Test on all descriptions.\n\nBSMF OFFER: Revenue Recovery Infrastructure, $4,997/mo, penalty-backed guarantee.\n\nYou report to Alex (CEO).",
      },
      budgetMonthlyCents: 5000,
    },
    {
      name: "QA",
      role: "general",
      title: "Quality Assurance Engineer",
      icon: "shield",
      reportsTo: alexId,
      capabilities: "Code review, copy review (buyer language check), deal verification, app refinement checklist audit, launch site QA, email QA.",
      adapterType: "claude_local",
      adapterConfig: {
        cwd: "C:\\Users\\John\\bluestar-hq",
        model: "claude-sonnet-4-6",
        dangerouslySkipPermissions: true,
        timeoutSec: 300,
        maxTurnsPerRun: 15,
        promptTemplate: "You are QA for Blue Star Holdings. Nothing ships without your sign-off.\n\nREVIEW CHECKLIST: Code (runs, passes lint, no secrets), Copy (buyer language, Hormozi Stupid Test, numbers), Deals (spread correct, buyer match logic sound), Apps (refinement checklist, paywall after value), Launch sites (mobile responsive, CTAs work), Emails (correct details, no typos).\n\nYou report to Alex (CEO).",
      },
      budgetMonthlyCents: 3000,
    },
    {
      name: "Revenue Ops",
      role: "general",
      title: "Revenue Operations / Sales",
      icon: "zap",
      reportsTo: alexId,
      capabilities: "Upwork pipeline, BSMF client acquisition ($4,997/mo), affiliate revenue, content marketing, app marketing. Rule of 100 daily outreach.",
      adapterType: "claude_local",
      adapterConfig: {
        cwd: "C:\\Users\\John\\bluestar-hq\\revenue-ops",
        model: "claude-sonnet-4-6",
        dangerouslySkipPermissions: true,
        timeoutSec: 300,
        maxTurnsPerRun: 20,
        promptTemplate: "You are Revenue Operations for Blue Star Holdings. Your metric: REVENUE GENERATED.\n\nDOMAINS: Upwork pipeline ($200/hr AI automation), BSMF clients ($4,997/mo), Affiliate revenue, Content marketing, App marketing.\n\nRULE OF 100 (daily): 25 warm outreach, 25 cold outreach, 25 min content, 25 min paid ads. More → Better → New.\n\nBSMF OFFER: Revenue Recovery Infrastructure. $4,997/mo. DFY AI lead conversion + speed-to-lead. 60-day penalty-backed guarantee.\n\nYou report to Alex (CEO).",
      },
      budgetMonthlyCents: 5000,
    },
    {
      name: "Finance",
      role: "general",
      title: "CFO / Financial Strategist",
      icon: "user",
      reportsTo: alexId,
      capabilities: "App pricing matrix, MRR projections, IBC strategy, API cost tracking, Profit First allocation. Value Equation math on all pricing.",
      adapterType: "claude_local",
      adapterConfig: {
        cwd: "C:\\Users\\John\\bluestar-hq\\finance-ops",
        model: "claude-sonnet-4-6",
        dangerouslySkipPermissions: true,
        timeoutSec: 300,
        maxTurnsPerRun: 15,
        promptTemplate: "You are Finance Operations for Blue Star Holdings.\n\nDOMAINS: App pricing matrix, MRR projections, IBC strategy + business credit, API cost tracking, Profit First cash allocation.\n\nRULES: Every pricing recommendation includes Value Equation math V = (DO × L) / (TD × E). Price ≤ 10% of calculated value. LTV > 10x CAC. Flag if burn exceeds revenue 2+ weeks.\n\nYou report to Alex (CEO).",
      },
      budgetMonthlyCents: 3000,
    },
    {
      name: "Research",
      role: "general",
      title: "R&D Director / Market Intelligence",
      icon: "sparkles",
      reportsTo: alexId,
      capabilities: "Competitor monitoring, trend radar, experiment tracking, M&A deal scanning (BizBuySell, Acquire.com, Empire Flippers, Flippa).",
      adapterType: "claude_local",
      adapterConfig: {
        cwd: "C:\\Users\\John\\bluestar-hq\\research-lab",
        model: "claude-sonnet-4-6",
        dangerouslySkipPermissions: true,
        timeoutSec: 300,
        maxTurnsPerRun: 15,
        promptTemplate: "You are Research & Development for Blue Star Holdings.\n\nDOMAINS: Competitor monitoring, Trend radar, Experiment tracking, M&A deal scanning.\n\nM&A CRITERIA: Revenue $100K-$2M/yr, Asking < 3x annual, Industries: AI/SaaS, content, service, local Reno/Sparks, RE, wellness.\n\nOUTPUT: Weekly competitor brief (Monday), M&A digest (Sunday), Experiment results log, Opportunity memos.\n\nYou report to Alex (CEO).",
      },
      budgetMonthlyCents: 3000,
    },
  ];

  const agentIds = { Alex: alexId };
  for (const agentDef of agents) {
    console.log(`Creating Agent: ${agentDef.name}...`);
    const result = await api("POST", `/api/companies/${COMPANY_ID}/agents`, agentDef);
    if (result) {
      agentIds[agentDef.name] = result.id;
      console.log(`  ✓ ${agentDef.name} created: ${result.id}`);
    }
  }
  console.log("\n--- Agent IDs ---");
  console.log(JSON.stringify(agentIds, null, 2));

  // ── 3. Create Projects ──
  console.log("\n=== Creating Projects ===\n");

  const projects = [
    { name: "P1 — Fast Cash", description: "Revenue activation from existing assets. ONLY priority until cash flows.", status: "in_progress", color: "#FF0000", leadAgentId: alexId },
    { name: "P2 — App Launch Sprint", description: "Submit all 9 apps to App Store + Google Play with ASO and launch campaigns.", status: "backlog", color: "#FF8C00", leadAgentId: agentIds["Engineer"] },
    { name: "P2 — Service Revenue", description: "Scale BSMF and Upwork into recurring revenue streams.", status: "backlog", color: "#FFD700", leadAgentId: agentIds["Revenue Ops"] },
    { name: "P2 — Content Engine", description: "Automated daily content publishing to all sites.", status: "backlog", color: "#32CD32", leadAgentId: agentIds["Engineer"] },
    { name: "P3 — Build Pipeline", description: "Idea-to-product pipeline for new ventures. After P2 MRR > $10K.", status: "backlog", color: "#4169E1", leadAgentId: agentIds["Engineer"] },
    { name: "P4 — M&A Acquisitions", description: "Ongoing deal scanning for business acquisitions.", status: "in_progress", color: "#800080", leadAgentId: agentIds["Research"] },
    { name: "Infrastructure", description: "Systems and automation setup.", status: "in_progress", color: "#708090", leadAgentId: agentIds["Engineer"] },
  ];

  const projectIds = {};
  for (const proj of projects) {
    console.log(`Creating Project: ${proj.name}...`);
    const result = await api("POST", `/api/companies/${COMPANY_ID}/projects`, proj);
    if (result) {
      projectIds[proj.name] = result.id;
      console.log(`  ✓ ${proj.name}: ${result.id}`);
    }
  }

  // ── 4. Create Issues ──
  console.log("\n=== Creating Issues ===\n");

  const issues = [
    // P1 — Fast Cash
    { projectId: projectIds["P1 — Fast Cash"], title: "Process all wholesale deals from Gmail — last 30 days", description: "Scan john@bluestarinvesting.org and offers@bluestarinvesting.org for all wholesale deal emails. Parse each deal. Score by spread. Match to buyer database. Draft blasts. Present for approval.", priority: "critical", assigneeAgentId: agentIds["RE Wholesaler"] },
    { projectId: projectIds["P1 — Fast Cash"], title: "Respond to Vincent Morgan — hot buyer waiting", description: "vincemorgan85@gmail.com emailed twice (March 5 + March 12) asking to buy off-market SFR. No response yet. Draft reply: send our active markets, ask for his buy box criteria.", priority: "critical", assigneeAgentId: agentIds["RE Wholesaler"] },
    { projectId: projectIds["P1 — Fast Cash"], title: "Send first 10 Upwork proposals", description: "Search Upwork for AI automation, n8n, Claude API, AI agent jobs with budget > $1K. Draft 10 proposals using the template from playbooks/outreach-scripts.md.", priority: "high", assigneeAgentId: agentIds["Revenue Ops"] },
    { projectId: projectIds["P1 — Fast Cash"], title: "Connect affiliate programs to directory sites", description: "Sign up for Sovrn, MaxBounty, ClickBank, Amazon Associates, Google AdSense. Connect to renosparksnav.com and prepperdirect.org. Both sites are live.", priority: "high", assigneeAgentId: agentIds["Revenue Ops"] },
    { projectId: projectIds["P1 — Fast Cash"], title: "Deploy Lead Leak Calculator on BSMF site", description: "The Lead Leak Calculator is ~60% built. Finish it. Deploy to bluestarmarketingfirm.com. It is the primary lead magnet for the $4,997/mo BSMF offer.", priority: "high", assigneeAgentId: agentIds["Engineer"] },
    { projectId: projectIds["P1 — Fast Cash"], title: "Start Rule of 100 outreach for BSMF", description: "Begin 100 daily actions targeting $500K-$5M service businesses. Use playbooks/outreach-scripts.md for warm and cold templates.", priority: "medium", assigneeAgentId: agentIds["Revenue Ops"] },

    // P2 — App Launch Sprint
    { projectId: projectIds["P2 — App Launch Sprint"], title: "Refine GateCheck — full checklist audit", description: "Run GateCheck through shared/refinement-checklist.md. Fix all items. Update apps/gatecheck/status.md to REFINEMENT COMPLETE when done.", priority: "high", assigneeAgentId: agentIds["Engineer"] },
    { projectId: projectIds["P2 — App Launch Sprint"], title: "Generate GateCheck ASO package", description: "Complete ASO: name (30 chars), subtitle (30 chars), keywords (100 chars), description, 6 screenshot captions, category, App Preview video script for Higgsfield.", priority: "high", assigneeAgentId: agentIds["Marketing"] },
    { projectId: projectIds["P2 — App Launch Sprint"], title: "Build GateCheck launch site", description: "Next.js 14 + Tailwind + Vercel. Dark luxury aesthetic. PhoneMockup, PricingTable, FAQAccordion, DownloadButtons, EmailCapture components.", priority: "high", assigneeAgentId: agentIds["Engineer"] },
    { projectId: projectIds["P2 — App Launch Sprint"], title: "QA review GateCheck before submission", description: "Review refinement checklist completion, ASO copy quality (buyer language check), launch site functionality. Sign off or reject with specific fixes.", priority: "high", assigneeAgentId: agentIds["QA"] },
    { projectId: projectIds["P2 — App Launch Sprint"], title: "Submit GateCheck to App Store + Google Play", description: "Ensure Small Business Program enrollment (15% vs 30% commission). Submit with ASO package.", priority: "high", assigneeAgentId: agentIds["Engineer"] },

    // P2 — Service Revenue
    { projectId: projectIds["P2 — Service Revenue"], title: "Close first BSMF client", description: "Use C.L.O.S.E.R. script from playbooks. $4,997/mo retainer. Penalty-backed guarantee.", priority: "high", assigneeAgentId: agentIds["Revenue Ops"] },
    { projectId: projectIds["P2 — Service Revenue"], title: "Build BSMF case study from first client results", description: "After 30 days of first client, compile results with specific numbers. Create Higgsfield video case study.", priority: "medium", assigneeAgentId: agentIds["Marketing"] },
    { projectId: projectIds["P2 — Service Revenue"], title: "Close first Upwork contract", description: "Target: $2K-$4K first contract at $200/hr.", priority: "high", assigneeAgentId: agentIds["Revenue Ops"] },

    // P2 — Content Engine
    { projectId: projectIds["P2 — Content Engine"], title: "Finish content generation system (85% built)", description: "The content gen system is ~85% done. Audit current state, identify gaps, complete. Connect to n8n for auto-publishing.", priority: "medium", assigneeAgentId: agentIds["Engineer"] },
    { projectId: projectIds["P2 — Content Engine"], title: "Set up daily content publishing workflow in n8n", description: "n8n workflow: Claude API generates articles → auto-publish to each site → submit to Google Search Console.", priority: "medium", assigneeAgentId: agentIds["Engineer"] },

    // P3 — Build Pipeline
    { projectId: projectIds["P3 — Build Pipeline"], title: "Validate AAAS (Agent as a Service) concept", description: "Market research and concept validation for Agent as a Service platform.", priority: "low", assigneeAgentId: agentIds["Research"] },
    { projectId: projectIds["P3 — Build Pipeline"], title: "Build Kaizen Research platform", description: "Build the Kaizen Research competitive intelligence platform.", priority: "low", assigneeAgentId: agentIds["Engineer"] },
    { projectId: projectIds["P3 — Build Pipeline"], title: "Launch ArbitrageVault scanner", description: "Build and launch the ArbitrageVault deal scanner.", priority: "low", assigneeAgentId: agentIds["Engineer"] },

    // P4 — M&A
    { projectId: projectIds["P4 — M&A Acquisitions"], title: "Set up weekly M&A deal scanner", description: "Scan BizBuySell, Acquire.com, Empire Flippers, Flippa weekly. Filter by BSH criteria. Top 5 matches → digest to President.", priority: "low", assigneeAgentId: agentIds["Research"] },

    // Infrastructure
    { projectId: projectIds["Infrastructure"], title: "Deploy n8n workflows on Hostinger VPS", description: "SSH into Hostinger VPS. Docker is running. Configure API keys. Import workflows: Upwork scanner, content publisher, RE deal parser.", priority: "high", assigneeAgentId: agentIds["Engineer"] },
    { projectId: projectIds["Infrastructure"], title: "Configure GHL pipelines", description: "GHL RenoSparks (lLe08pNjRboHuWXnvlXn) + BlueStar (EJd0jSoYmA2ogVGaV7FA). Create RE Wholesale pipeline (Deal Received → Blast Sent → Buyer Interested → Deal Locked → Under Contract → Closed) and BSMF Clients pipeline.", priority: "high", assigneeAgentId: agentIds["Engineer"] },
    { projectId: projectIds["Infrastructure"], title: "Enroll Apple Developer + Google Play accounts", description: "Apple Developer ($99/yr) — enroll in Small Business Program. Google Play ($25 one-time). Both needed before any app submission. REQUIRES JOHN ACTION.", priority: "critical", assigneeAgentId: alexId },
    { projectId: projectIds["Infrastructure"], title: "Finish RE buyer matching system (70% built)", description: "Partial system exists for matching wholesale deals to buyer list. Audit, complete, connect to GHL pipeline.", priority: "high", assigneeAgentId: agentIds["Engineer"] },
    { projectId: projectIds["Infrastructure"], title: "Finish AI RE Agent n8n workflow (90% built)", description: "Nearly complete n8n workflow. Needs API key configuration and deployment to Hostinger VPS.", priority: "high", assigneeAgentId: agentIds["Engineer"] },
  ];

  let issueCount = 0;
  for (const issue of issues) {
    const result = await api("POST", `/api/companies/${COMPANY_ID}/issues`, issue);
    if (result) {
      issueCount++;
      console.log(`  ✓ ${result.identifier}: ${issue.title.substring(0, 60)}...`);
    }
  }
  console.log(`\nCreated ${issueCount} issues.\n`);

  // ── 5. Create Routines ──
  console.log("=== Creating Routines ===\n");

  const infraProjectId = projectIds["Infrastructure"];
  const p1ProjectId = projectIds["P1 — Fast Cash"];

  const routines = [
    { projectId: p1ProjectId, title: "Deal Scanner — scan Gmail for wholesale deals", description: "Scan Gmail for new wholesale deal emails. Parse, score, match, draft blasts. Run 3x daily.", assigneeAgentId: agentIds["RE Wholesaler"], priority: "critical" },
    { projectId: projectIds["P2 — Content Engine"], title: "Content Publisher — daily SEO articles", description: "Generate 1 SEO article per active site. Auto-publish. Submit to Search Console.", assigneeAgentId: agentIds["Marketing"], priority: "medium" },
    { projectId: projectIds["P2 — Service Revenue"], title: "Upwork Scanner — find AI/automation jobs", description: "Search Upwork for AI/automation jobs >$1K. Draft proposals. Run 2x daily.", assigneeAgentId: agentIds["Revenue Ops"], priority: "high" },
    { projectId: p1ProjectId, title: "Buyer Pulse — weekly buyer check-in", description: "Email all active buyers: Updated buy box? Still buying? Track responses. Update database.", assigneeAgentId: agentIds["RE Wholesaler"], priority: "medium" },
    { projectId: projectIds["P4 — M&A Acquisitions"], title: "M&A Scanner — weekly deal digest", description: "Scan BizBuySell, Acquire.com, Empire Flippers, Flippa. Score top 5. Digest to President.", assigneeAgentId: agentIds["Research"], priority: "low" },
    { projectId: infraProjectId, title: "KPI Review — Monday scorecard", description: "Compile scorecard: revenue by source, deals processed, apps submitted, content published, proposals sent.", assigneeAgentId: alexId, priority: "high" },
    { projectId: infraProjectId, title: "Daily Briefing — morning status report", description: "Read all agent statuses. Compile critical path + decisions + pipeline + actions for President.", assigneeAgentId: alexId, priority: "critical" },
    { projectId: infraProjectId, title: "End of Day — evening summary", description: "Summarize day across all agents. Update portfolio register. Write tomorrow's critical path.", assigneeAgentId: alexId, priority: "high" },
  ];

  for (const routine of routines) {
    const result = await api("POST", `/api/companies/${COMPANY_ID}/routines`, routine);
    if (result) {
      console.log(`  ✓ Routine: ${routine.title.substring(0, 50)}... → ${result.id}`);
    }
  }

  // ── 6. Add schedule triggers to routines ──
  // We'll add these after getting the routine IDs
  console.log("\n=== Adding Schedule Triggers ===\n");

  // List routines to get IDs
  const routinesRes = await api("GET", `/api/companies/${COMPANY_ID}/routines`);
  if (routinesRes) {
    const routineList = Array.isArray(routinesRes) ? routinesRes : routinesRes.routines || [];
    const triggers = {
      "Deal Scanner": { cronExpression: "0 8,12,16 * * *", timezone: "America/Los_Angeles", label: "3x daily (8AM, 12PM, 4PM PT)" },
      "Content Publisher": { cronExpression: "0 6 * * *", timezone: "America/Los_Angeles", label: "Daily 6AM PT" },
      "Upwork Scanner": { cronExpression: "0 9,13 * * *", timezone: "America/Los_Angeles", label: "2x daily (9AM, 1PM PT)" },
      "Buyer Pulse": { cronExpression: "0 9 * * 1", timezone: "America/Los_Angeles", label: "Monday 9AM PT" },
      "M&A Scanner": { cronExpression: "0 20 * * 0", timezone: "America/Los_Angeles", label: "Sunday 8PM PT" },
      "KPI Review": { cronExpression: "0 10 * * 1", timezone: "America/Los_Angeles", label: "Monday 10AM PT" },
      "Daily Briefing": { cronExpression: "0 8 * * *", timezone: "America/Los_Angeles", label: "Daily 8AM PT" },
      "End of Day": { cronExpression: "0 18 * * *", timezone: "America/Los_Angeles", label: "Daily 6PM PT" },
    };

    for (const r of routineList) {
      for (const [keyword, triggerDef] of Object.entries(triggers)) {
        if (r.title && r.title.includes(keyword)) {
          const trig = await api("POST", `/api/routines/${r.id}/triggers`, {
            kind: "schedule",
            ...triggerDef,
            enabled: true,
          });
          if (trig) {
            console.log(`  ✓ Trigger: ${keyword} → ${triggerDef.cronExpression}`);
          }
          break;
        }
      }
    }
  }

  // ── Summary ──
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║  BLUE STAR HOLDINGS — SETUP COMPLETE         ║");
  console.log("╠══════════════════════════════════════════════╣");
  console.log(`║  Company: ${COMPANY_ID.substring(0, 8)}...       ║`);
  console.log(`║  Agents: ${Object.keys(agentIds).length} created                        ║`);
  console.log(`║  Projects: ${Object.keys(projectIds).length} created                      ║`);
  console.log(`║  Issues: ${issueCount} created                       ║`);
  console.log("╚══════════════════════════════════════════════╝");
  console.log("\nAgent IDs:", JSON.stringify(agentIds, null, 2));
  console.log("\nProject IDs:", JSON.stringify(projectIds, null, 2));
}

main().catch(console.error);
