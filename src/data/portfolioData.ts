export interface CaseStudyStep {
  label: string;
  title: string;
  summary: string;
}

export interface DecisionRow {
  decision: string;
  reasoning: string;
  tradeoff: string;
}

export interface CaseLinks {
  githubUrl?: string;
  githubRepoName?: string;
  lovableUrl?: string;
}

export type CaseLinksMap = Record<string, CaseLinks>;

export interface CaseStudy {
  id: string;
  slug: string;
  index: string;
  eyebrow: string;
  label: string;
  title: string;
  subtitle: string;
  summary: string;
  tags: string[];
  pastelBg: string;
  pastelBorder: string;
  accentColor: string;
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
  secondaryImageSrc?: string;
  secondaryImageAlt?: string;
  secondaryImageCaption?: string;
  isWorkflowPreview?: boolean;
  defaultLovableUrl?: string;
  lovableLabel?: string;
  pdfUrl?: string;
  meta: {
    roleLabel: string;
    roleValue: string;
    forLabel: string;
    forValue: string;
    contextLabel: string;
    contextValue: string;
  };
  threeSteps: [CaseStudyStep, CaseStudyStep, CaseStudyStep];
  storyInBrief: string;
  problemTitle: string;
  problemBody: string;
  problemQuote: string;
  decisionsTitle: string;
  decisions: DecisionRow[];
  validationPoints: string[];
  validationNote: string;
  stack: string[];
  hasWindProxySimulator?: boolean;
}

export interface MindPhotoSlot {
  id: string;
  title: string;
  caption: string;
  alt: string;
  expectedFilenames: string[];
}

export interface MindWorkHighlight {
  title: string;
  role: string;
  summary: string;
}

export interface MindNode {
  id: string;
  index: number;
  label: string;
  subtitle: string;
  featuredFlagship?: boolean;
  categoryBadge?: string;
  xPercent: number;
  yPercent: number;
  color: string;
  summary: string;
  ctaLabel: string;
  targetRoute: 'case' | 'resume';
  targetId?: string;
  featuredCaseIds: string[];
  workHighlights?: MindWorkHighlight[];
  highlights?: { label: string; value: string }[];
  photoSlots?: MindPhotoSlot[];
  thoughtStory: {
    spark: string;
    tried: string;
    next: string;
  };
}

export const BELIEFS = [
  { number: '01', text: 'Pressure is a privilege.' },
  { number: '02', text: 'Opportunities are meant to be created, not found.' },
  { number: '03', text: 'Build things that scare you and are bigger than yourself.' },
  { number: '04', text: 'Ambition without action is just anxiety.' },
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'aditis-wardrobe',
    slug: 'aditis-wardrobe',
    index: '01',
    eyebrow: '01 / Product case study',
    label: 'Built with Lovable',
    title: 'Aditi’s Wardrobe',
    subtitle: 'AI Digital Closet',
    summary:
      'An AI-powered digital closet that remembers every saree so my mom never has to.',
    tags: ['AI', 'Consumer product', 'Solo build'],
    pastelBg: '#e9edff',
    pastelBorder: '#d8defb',
    accentColor: '#2448f5',
    imageSrc: '/images/projects/wardrobe-plan.png',
    imageAlt:
      'Aditi’s Wardrobe app screens showing saree catalog, wear logging, and event repeat-check planning',
    imageCaption:
      'Actual app capture — Plan Event turns the guest list into the starting point for choosing a saree.',
    secondaryImageSrc: '/images/projects/wardrobe-collection.png',
    secondaryImageAlt:
      'Aditi’s Wardrobe digital saree collection grid showing catalogued outfits and wear history',
    secondaryImageCaption:
      'Actual app capture — A visual collection makes the wardrobe browsable without searching old photos.',
    defaultLovableUrl: 'https://outfit-memory-maker.lovable.app/',
    lovableLabel: 'View live app',
    meta: {
      roleLabel: 'Role',
      roleValue: 'Solo product owner & builder',
      forLabel: 'Made for',
      forValue: 'My mom',
      contextLabel: 'Context',
      contextValue: 'Mother’s Day hackathon',
    },
    threeSteps: [
      {
        label: '01',
        title: 'Add a saree',
        summary: 'A photo becomes a catalogued item with GPT-4o vision tagging.',
      },
      {
        label: '02',
        title: 'Log a wear',
        summary: 'Record the occasion and who was there to build a memory timeline.',
      },
      {
        label: '03',
        title: 'Plan an event',
        summary: 'Compare an upcoming guest list against past wears before choosing.',
      },
    ],
    storyInBrief:
      'I built Aditi’s Wardrobe for Lovable’s Mother’s Day hackathon as a gift for my mom. I owned the PRD, MVP scope, build, and iteration, with my mom as the tester. Validation so far is qualitative feedback from my mom; broader adoption and willingness to pay are still untested.',
    problemTitle: 'Finding the real problem',
    problemBody:
      'My mom owns 100+ sarees. Before a wedding, puja, or dinner, she searches years of photos to remember what she wore, when, and who was there. The decision depends on the people attending, not just the last time she wore an outfit. That made wear history and guest overlap central to the product.',
    problemQuote:
      'Before this event, which sarees can I wear without repeating one in front of the same people?',
    decisionsTitle: 'Decisions & tradeoffs',
    decisions: [
      {
        decision: 'Remove login',
        reasoning: 'I watched my mom stall at sign-up and removed that step entirely.',
        tradeoff: 'Before expanding, access, privacy, and recovery must work without adding friction back.',
      },
      {
        decision: 'AI tags & names',
        reasoning: 'GPT-4o vision reduces manual entry when adding a saree from a photo.',
        tradeoff: 'Generated descriptions may need correction; accuracy and effort still need testing.',
      },
      {
        decision: 'Guest-based repeat check',
        reasoning: 'The relevant context is who has seen an outfit before.',
        tradeoff: 'The recommendation is only as complete as recorded wear history and guest lists.',
      },
      {
        decision: 'Pixel-art visual style',
        reasoning: 'Connects with my mom’s 2000s computer nostalgia and personal style.',
        tradeoff: 'A style tailored for one person may need adaptation for a broader audience.',
      },
    ],
    validationPoints: [
      'Can people get to a useful collection? Observe where they stall adding outfits and effort needed to correct AI tags.',
      'Does event planning help? Watch someone plan a real event using the guest-based recommendation.',
      'Will people maintain wear history? Check whether they log later wears and return before another event.',
    ],
    validationNote: 'These are proposed validation questions, not measured results.',
    stack: ['Lovable', 'TanStack Start', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'GPT-4o Vision'],
  },
  {
    id: 'hoarding-wind-simulator',
    slug: 'hoarding-wind-simulator',
    index: '02',
    eyebrow: '02 / Product case study',
    label: 'Engineering & 3D',
    title: 'Hoarding Wind Stress Simulator',
    subtitle: 'Preliminary Design Exploration Tool',
    summary:
      'A browser-based 3D tool for my dad’s Mumbai advertising business, turning wind scenarios into preliminary design insights.',
    tags: ['Three.js', 'Engineering model', 'Product design'],
    pastelBg: '#eaf3f8',
    pastelBorder: '#cfe2ee',
    accentColor: '#1a5276',
    imageSrc: '/images/projects/wind-simulator.png',
    imageAlt:
      'Live hoarding simulator showing design controls beside a 3D billboard and model verdict',
    imageCaption:
      'Actual app capture — Built for my father’s Mumbai advertising business. Design inputs stay beside the 3D scene and preliminary verdict.',
    secondaryImageSrc: '/images/projects/wind-calculations.png',
    secondaryImageAlt:
      'Expandable engineering calculation breakdown inside Hoarding Wind Stress Simulator',
    secondaryImageCaption:
      'Actual app capture — The expandable calculation output makes model assumptions and failure checks visible.',
    defaultLovableUrl: 'https://hoarding-vision-engine.lovable.app',
    lovableLabel: 'View live simulator',
    meta: {
      roleLabel: 'My contribution',
      roleValue: 'Product design & simulator build',
      forLabel: 'Made for',
      forValue: 'My father’s business',
      contextLabel: 'Focus',
      contextValue: 'Preliminary design exploration',
    },
    threeSteps: [
      {
        label: '01',
        title: 'Configure',
        summary: 'Choose Mumbai terrain, 10 soil categories, 4 foundations, and wind scenario.',
      },
      {
        label: '02',
        title: 'Visualise',
        summary: 'Inspect the proposed hoarding in an interactive 3D scene under load.',
      },
      {
        label: '03',
        title: 'Review',
        summary: 'Read safe, marginal, or unsafe proxy verdicts and calculations with an engineer.',
      },
    ],
    storyInBrief:
      'I built a browser-based 3D simulator for my father’s outdoor advertising business in Mumbai. It helps him explore a proposed hoarding’s response to wind before committing to steel and concrete. This is a preliminary design exploration proxy model—every proposed structure still requires review and sign-off by a licensed structural engineer.',
    problemTitle: 'The problem behind the tool',
    problemBody:
      'My dad designs and installs hoardings across Mumbai. Before each monsoon, the same question returns: will this structure hold? The May 2024 Ghatkopar hoarding collapse made that concern especially immediate. I wanted to help him discuss a proposal with numbers and visible scenarios alongside his experience.',
    problemQuote:
      'How can I make an early structural check understandable enough that he will actually use it?',
    decisionsTitle: 'Decisions & tradeoffs',
    decisions: [
      {
        decision: 'Presets before parameters',
        reasoning: 'Plain-language storm and soil choices make initial exploration approachable.',
        tradeoff: 'Preset soil categories cannot replace site-specific geotechnical investigation.',
      },
      {
        decision: 'Three consistent verdicts',
        reasoning: 'Safe, marginal, and unsafe provide a result that is easy to find and compare.',
        tradeoff: 'A simple label can hide uncertainty; its meaning depends on the model and inputs.',
      },
      {
        decision: 'Interactive 3D scene',
        reasoning: 'My dad thinks visually about structures; a rotatable scene makes modeled response tangible.',
        tradeoff: 'Visual realism must not be mistaken for certified engineering accuracy.',
      },
      {
        decision: 'Candidate design changes',
        reasoning: 'A failed scenario supports a concrete next conversation on pole and foundation sizing.',
        tradeoff: 'Suggestions are candidates for a licensed engineer to verify, not guaranteed fixes.',
      },
    ],
    validationPoints: [
      'Compare proxy model outputs against calculations reviewed by a licensed structural engineer across representative configurations.',
      'Observe how operators interpret safe/marginal/unsafe verdicts and which assumptions need professional review.',
      'Record IS 875 (Part 3), IS 800, and BMC 2025 advertisement policy references transparently.',
    ],
    validationNote:
      'Wind-simulator results are preliminary proxy-model outputs, not certified engineering approval.',
    stack: ['Three.js', 'Engineering proxy model', 'Product design', 'IS 875 & IS 800 reference'],
    hasWindProxySimulator: true,
  },
  {
    id: 'loreal-brandstorm',
    slug: 'loreal-brandstorm',
    index: '03',
    eyebrow: '03 / Product concept',
    label: 'Top 10 regional finalist',
    title: 'L’Oréal Brandstorm: NFC Beauty Experience',
    subtitle: 'Smart Packaging Concept',
    summary:
      'A smart-packaging concept connecting physical beauty products to personalised digital experiences through NFC.',
    tags: ['NFC prototype', 'Sustainability', 'Brand storytelling'],
    pastelBg: '#f6eef8',
    pastelBorder: '#e6d4ec',
    accentColor: '#6d3085',
    imageSrc: '/images/projects/beauty-experience.png',
    imageAlt:
      'AURALIS fragrance prototype showing personal message, purchase history, refill and ingredient experiences',
    imageCaption:
      'Actual prototype capture — The linked AURALIS prototype presents four post-purchase experiences around a fragrance.',
    secondaryImageSrc: '/images/projects/beauty-refill.png',
    secondaryImageAlt: 'Refill journey interface screen in AURALIS NFC fragrance prototype',
    secondaryImageCaption:
      'Actual prototype capture — The refill journey demonstrates the concept’s intended return touchpoint. Locations are prototype content.',
    defaultLovableUrl: 'https://scent-heirloom-keeper.lovable.app/',
    lovableLabel: 'View live prototype',
    meta: {
      roleLabel: 'My contribution',
      roleValue: 'Concept, prototype & business case',
      forLabel: 'Context',
      forValue: 'L’Oréal Brandstorm',
      contextLabel: 'Outcome',
      contextValue: 'Top 10 regional finalist',
    },
    threeSteps: [
      {
        label: '01',
        title: 'Tap the packaging',
        summary: 'Enter the proposed NFC experience directly from the bottle.',
      },
      {
        label: '02',
        title: 'Discover value',
        summary: 'Explore ingredient stories, sourcing transparency, and tutorials.',
      },
      {
        label: '03',
        title: 'Return & refill',
        summary: 'Receive refill reminders and engage with proposed loyalty rewards.',
      },
    ],
    storyInBrief:
      'For L’Oréal Brandstorm, I designed an NFC-enabled packaging concept that connects a physical beauty product to a personalised digital experience. The project spanned consumer insight, a live prototype (AURALIS), a phased rollout business case, pitch deck, and brand film—reaching the Top 10 regional finals.',
    problemTitle: 'The opportunity',
    problemBody:
      'The brief challenged us to imagine beauty experiences that are sustainable, personal, and digitally connected. I focused on the gap between a physical bottle someone holds every day and the guidance, sourcing stories, and refill routines scattered online.',
    problemQuote:
      'What if the bottle offered value beyond the product inside it?',
    decisionsTitle: 'Product thinking & tradeoffs',
    decisions: [
      {
        decision: 'NFC in packaging',
        reasoning: 'Make the product itself an entry point into the digital experience.',
        tradeoff: 'Hardware cost, device discoverability, and fallback QR paths need assessment.',
      },
      {
        decision: 'Post-purchase tutorials',
        reasoning: 'Useful guidance gives people a reason to engage beyond a one-time campaign.',
        tradeoff: 'Need to test which content actually drives repeat visits.',
      },
      {
        decision: 'Refill reminders & rewards',
        reasoning: 'Connect post-purchase engagement to a proposed refill or return journey.',
        tradeoff: 'Reminders alone do not prove waste reduction without operational validation.',
      },
      {
        decision: 'Explicit opt-in',
        reasoning: 'Personalisation should only use skin/routine data consumers choose to share.',
        tradeoff: 'An NFC tap is not consent; the flow needs clear data controls.',
      },
    ],
    validationPoints: [
      'Discovery: Do shoppers notice the NFC prompt and successfully open the experience?',
      'Value: Which content do they use, and do they return after the first tap?',
      'Behaviour: Do refill prompts lead to completed refills or container returns?',
    ],
    validationNote:
      'Finalist outcome reflects competition progression; commercial adoption and sustainability results are proposed pilot questions.',
    stack: ['NFC Prototype', 'Lovable', 'Product Strategy', 'Phased GTM Rollout', 'Brand Storytelling'],
  },
  {
    id: 'gtm-prospect-finder',
    slug: 'gtm-prospect-finder',
    index: '04',
    eyebrow: '04 / Product case study',
    label: 'Built with Lovable',
    title: 'GTM Prospect Finder',
    subtitle: 'AI-Assisted Outreach Preparation',
    summary:
      'A focused B2B outreach tool combining ranked prospects, likely pain points, opening lines, and LinkedIn search links.',
    tags: ['AI', 'B2B outreach', 'Sales enablement'],
    pastelBg: '#fbf4e5',
    pastelBorder: '#eadbc0',
    accentColor: '#7b5816',
    isWorkflowPreview: true,
    lovableLabel: 'View live app',
    meta: {
      roleLabel: 'Role',
      roleValue: 'Solo product builder (2-day MVP)',
      forLabel: 'Audience',
      forValue: 'GTM operators & founders',
      contextLabel: 'Built with',
      contextValue: 'Lovable & AI-assisted ranking',
    },
    threeSteps: [
      {
        label: '01',
        title: 'Add context',
        summary: 'Enter the target company and describe the offer in one view.',
      },
      {
        label: '02',
        title: 'Compare prospects',
        summary: 'Review ranked profiles with seniority, likely pain points, and openers.',
      },
      {
        label: '03',
        title: 'Verify & act',
        summary: 'Use a LinkedIn search link to verify identity and role before sending.',
      },
    ],
    storyInBrief:
      'Built end to end in Lovable over two days to answer two questions in a single workspace: who should I contact at this account, and why would my offer matter to them? The tool keeps the human in charge of verification and what gets sent.',
    problemTitle: 'Fragmented outreach prep',
    problemBody:
      'Before reaching out to an account, a seller moves across prospecting databases, LinkedIn, and an AI assistant. Generic contact lists force the rep to infer relevance and write the opening line separately.',
    problemQuote:
      'Help me choose a relevant person and prepare a useful first message in the same place.',
    decisionsTitle: 'Product decisions & tradeoffs',
    decisions: [
      {
        decision: 'One-screen interface',
        reasoning: 'Inputs on the left and ranked results on the right keep account context visible.',
        tradeoff: 'Requires disciplined result structure as prospect lists grow.',
      },
      {
        decision: 'Multi-signal ranking',
        reasoning: 'Blend seniority, function fit, and inferred buying influence rather than title alone.',
        tradeoff: 'Buying influence is inferred; high rank does not guarantee authority.',
      },
      {
        decision: 'Offer-tied pain points',
        reasoning: 'Ground suggested openers in what the user is actually selling.',
        tradeoff: 'Likely pain points remain hypotheses until verified with the prospect.',
      },
      {
        decision: 'LinkedIn search link',
        reasoning: 'Bridge AI suggestions straight to checking a real person before messaging.',
        tradeoff: 'Search links help verification; they are not guaranteed verified profile URLs.',
      },
    ],
    validationPoints: [
      'Prospect quality: Compare suggested rankings against a GTM operator’s account review.',
      'Time to usable shortlist: Measure prep time with and without the tool including verification.',
      'Message usefulness: Assess editing effort per opener and whether claims are supported.',
    ],
    validationNote:
      'These are proposed validation steps; no measured time savings or reply-rate uplift is claimed.',
    stack: ['Lovable', 'AI-assisted ranking', 'B2B outreach', 'Sales enablement'],
  },
  {
    id: 'climate-outreach',
    slug: 'climate-outreach',
    index: '05',
    eyebrow: '05 / GTM strategy',
    label: 'Outreach automation',
    title: 'Automating Outreach for Climate SaaS',
    subtitle: 'Signal-Based Outbound Blueprint',
    summary:
      'A signal-based GTM blueprint connecting sourcing, AI enrichment, routing, and sales follow-up.',
    tags: ['Clay', 'n8n', 'Lemlist', 'HubSpot'],
    pastelBg: '#edf4ee',
    pastelBorder: '#cfe2d2',
    accentColor: '#1b5e37',
    imageSrc: '/images/projects/climate-architecture.png',
    imageAlt:
      'Original case study deck page showing sourcing, enrichment, routing and outreach architecture',
    imageCaption:
      'Original deck page — Proposed sourcing-to-CRM architecture. Zero-bounce phrasing in the deck is an aspiration, not a guarantee.',
    secondaryImageSrc: '/images/projects/climate-funnel.png',
    secondaryImageAlt: 'Illustrative six-month revenue-to-pipeline funnel model from €600K target',
    secondaryImageCaption:
      'Original deck page — Planning model working backward from a €600K closed-revenue target. Assumptions, not achieved results.',
    pdfUrl: '/projects/climate-outreach/Nishtha-Bahal-B2B-SaaS-Case-Study.pdf',
    meta: {
      roleLabel: 'My contribution',
      roleValue: 'GTM blueprint & funnel planning',
      forLabel: 'Audience',
      forValue: 'B2B climate SaaS · Europe',
      contextLabel: 'Planning target',
      contextValue: '€600K closed revenue (model)',
    },
    threeSteps: [
      {
        label: '01',
        title: 'Source & enrich',
        summary: 'Apollo, Sales Navigator, and Clay waterfall + Claygent CSR checks.',
      },
      {
        label: '02',
        title: 'Route by signal',
        summary: 'n8n separates high-signal accounts from longer-term nurture paths.',
      },
      {
        label: '03',
        title: 'Execute & learn',
        summary: 'Lemlist, HubSpot CRM sync, and context-rich Slack hand-offs.',
      },
    ],
    storyInBrief:
      'Designed a scalable outbound blueprint for a B2B climate SaaS firm serving European sustainability teams. Connects role-based sourcing with public intent signals (sustainability hiring, ESG reports, tooling gaps) and reverse-engineers a €600K closed-revenue capacity plan.',
    problemTitle: 'Start with relevance and timing',
    problemBody:
      'Job titles establish who may be relevant, while public business signals explain why a conversation matters now. Combining fit with timing gives every outbound message a specific, verifiable hook rather than generic volume.',
    problemQuote:
      'Send the rep a reason to reach out, not just another contact.',
    decisionsTitle: 'Decisions behind the workflow',
    decisions: [
      {
        decision: 'Require a reason for outreach',
        reasoning: 'At least one public signal qualifies a lead for the high-signal path.',
        tradeoff: 'False-positive signals require weekly prompt and audit tuning.',
      },
      {
        decision: 'Separate fit from intent',
        reasoning: 'Persona search finds fit; parallel signal workflows identify timing.',
        tradeoff: 'Neither alone confirms active buying interest.',
      },
      {
        decision: 'Automate triage via n8n',
        reasoning: 'Prioritise rep bandwidth for strong signals while nurturing broader accounts.',
        tradeoff: 'Requires maintaining clean webhook logic and fallback routing.',
      },
      {
        decision: 'Context-rich Slack hand-off',
        reasoning: 'Deliver intent hook, contact info, and history straight to the rep.',
        tradeoff: 'Depends on accurate HubSpot activity sync.',
      },
    ],
    validationPoints: [
      'Deliverability target >95% with weekly bounce and Clay enrichment audits.',
      'Positive reply target 2–4%, compared across trigger types and messaging.',
      'Validate €2.73M pipeline / 136 opportunity funnel assumptions against live results before scaling.',
    ],
    validationNote:
      'Presents a GTM strategy and capacity planning assumptions, not measured campaign outcomes.',
    stack: ['Apollo', 'LinkedIn Sales Navigator', 'Clay & Claygent', 'n8n', 'Lemlist', 'HubSpot', 'Slack'],
  },
];

export const MIND_NODES: MindNode[] = [
  {
    id: 'nightshift-ai',
    index: 0,
    label: 'NightShift AI',
    subtitle: 'Founder · Tsai CITY Launchpad, Yale',
    featuredFlagship: true,
    categoryBadge: 'AI Venture · Flagship',
    xPercent: 48,
    yPercent: 20,
    color: '#c3b0f6',
    summary:
      'I founded NightShift AI inside Tsai CITY’s Launchpad startup incubator at Yale—building practical overnight AI agent workflows so lean teams wake up to verified research, synthesized briefs, and ready-to-act pipelines.',
    ctaLabel: 'See NightShift AI in my resume',
    targetRoute: 'resume',
    featuredCaseIds: ['gtm-prospect-finder'],
    highlights: [
      {
        label: 'Tsai CITY Launchpad',
        value: 'Selected for Yale University’s startup incubator cohort building applied AI workflows',
      },
      {
        label: 'Core product thesis',
        value: 'Human-in-the-loop overnight automation with confidence guardrails before action',
      },
    ],
    workHighlights: [
      {
        title: 'NightShift AI · Overnight Agent Workflows',
        role: 'Founder · Yale Tsai CITY Launchpad',
        summary:
          'Turning multi-hour overnight research, signal gathering, and triage loops into structured morning briefs ready for human review.',
      },
      {
        title: 'HYFIN · Asian Green Finance Intelligence Agent',
        role: 'Precursor Workflow · ClickUp & Scraping',
        summary:
          'Built a daily AI agent scanning green finance updates across 10 Asian markets into ClickUp, cutting 10+ hours of manual research every week.',
      },
    ],
    photoSlots: [
      {
        id: 'nightshift-launchpad',
        title: 'NightShift AI · Tsai CITY Launchpad',
        caption: 'Building NightShift AI inside Tsai CITY at Yale University.',
        alt: 'NightShift AI at Yale Tsai CITY Launchpad',
        expectedFilenames: ['nightshift', 'nightshift-ai', 'tsai-city', 'launchpad'],
      },
      {
        id: 'nightshift-workflow',
        title: 'NightShift AI · Product & Demo',
        caption: 'Overnight agent interface and morning synthesis workflow.',
        alt: 'NightShift AI product screen or demo session',
        expectedFilenames: ['nightshift-demo', 'nightshift-app', 'nightshift-ui'],
      },
    ],
    thoughtStory: {
      spark: 'The best AI tools do heavy background prep while you sleep—then hand clear judgment back to you.',
      tried: 'Launched NightShift AI into Tsai CITY Launchpad after seeing how much time GTM and research teams lose on manual overnight prep.',
      next: 'Shipping repeatable agent workflows with transparent confidence signals and human sign-off.',
    },
  },
  {
    id: 'entrepreneurship',
    index: 1,
    label: 'Entrepreneurship',
    subtitle: 'Entrepreneurs@INSEAD · ClearCarbon · Ventures',
    featuredFlagship: true,
    categoryBadge: 'Founder & Ventures · Flagship',
    xPercent: 76,
    yPercent: 22,
    color: '#d4b8f2',
    summary:
      'From cofounding ClearCarbon and founding Entrepreneurs@INSEAD and Women’s Mentorship across France & Singapore to growing SideQuest Yale—I love building both startups and the founder rooms around them.',
    ctaLabel: 'View ventures on Resume',
    targetRoute: 'resume',
    featuredCaseIds: ['loreal-brandstorm', 'climate-outreach'],
    highlights: [
      {
        label: 'Entrepreneurs@INSEAD',
        value: 'Founded INSEAD’s student founder community across Fontainebleau and Singapore',
      },
      {
        label: 'ClearCarbon (Cofounder)',
        value: 'Head of GTM & Product Marketing · 20+ customer interviews · 3 EU carbon willingness-to-pay segments',
      },
      {
        label: 'Women’s Mentorship at INSEAD',
        value: 'Founded cross-cohort mentorship connecting aspiring women founders and builders',
      },
      {
        label: 'SideQuest Yale (Founder & President)',
        value: 'Built a 300+ Yale builder community and co-organized the Jackpot Hackathon',
      },
    ],
    workHighlights: [
      {
        title: 'ClearCarbon · Climate Compliance SaaS',
        role: 'Cofounder, Head of GTM & Product Marketing · Singapore / France',
        summary:
          'Repositioned product messaging from emissions tracking to cost savings after 20+ interviews with Asian manufacturers and enterprise buyers.',
      },
      {
        title: 'Entrepreneurs@INSEAD & Founder Ecosystems',
        role: 'Founder · INSEAD & Yale SOM',
        summary:
          'Created spaces where technical and non-technical builders pitch, test ideas with real customers, and ship side by side.',
      },
    ],
    photoSlots: [
      {
        id: 'entrepreneurs-stage',
        title: 'INSEAD Stage · Global Founders & Careers',
        caption: 'Speaking on stage at INSEAD under “Global Education for Global Careers.”',
        alt: 'Nishtha on stage in front of the INSEAD Global Education for Global Careers screen',
        expectedFilenames: ['WhatsApp Image 2026-05-26 at 00.04.05.jpeg'],
      },
      {
        id: 'entrepreneurs-founders',
        title: 'ClearCarbon & Founder Sessions',
        caption: 'Building ClearCarbon, Entrepreneurs@INSEAD, and founder workshops.',
        alt: 'Founders and student builders gathered at an entrepreneurship session',
        expectedFilenames: ['clearcarbon', 'insead-founders', 'entrepreneurs'],
      },
    ],
    thoughtStory: {
      spark: 'Opportunities are meant to be created, not waited on—both when launching a venture and building a room for other founders.',
      tried: 'Cofounded ClearCarbon, founded Entrepreneurs@INSEAD and Women’s Mentorship, launched NightShift AI, and built SideQuest Yale.',
      next: 'Bridging zero-to-one product intuition, climate & AI innovation, and commercial GTM discipline.',
    },
  },
  {
    id: 'sidequest-yale',
    index: 2,
    label: 'SideQuest Yale',
    subtitle: '300+ builders & Jackpot Hackathon',
    xPercent: 54,
    yPercent: 45,
    color: '#cbbbe6',
    summary:
      'I founded and run SideQuest Yale, a community of 300+ Yale builders turning side projects into shipped software—including the Jackpot Hackathon I organized with Base44 and Corgi.',
    ctaLabel: 'See SideQuest Yale in my resume',
    targetRoute: 'resume',
    featuredCaseIds: [],
    highlights: [
      {
        label: 'Builder community',
        value: '300+ Yale students & makers shipping weekend products and live demos',
      },
      {
        label: 'Jackpot Hackathon',
        value: 'Co-organized Base44 × SideQuest Yale × Corgi hackathon with live Waypoint & team pitches',
      },
    ],
    photoSlots: [
      {
        id: 'jackpot-welcome',
        title: 'Jackpot Hackathon kickoff',
        caption: 'Welcome to the Jackpot Hackathon — Base44 × SideQuest Yale × Corgi.',
        alt: 'Nishtha holding a laptop showing the Welcome to the Jackpot Hackathon slide by Base44, SideQuest Yale, and Corgi',
        expectedFilenames: ['DSC06801.jpg'],
      },
      {
        id: 'jackpot-group',
        title: 'Builders & organizers',
        caption: 'Full group of hackathon builders gathered under the Base44 × SideQuest × Corgi screen.',
        alt: 'Group photo of ~20 builders and organizers at the Jackpot Hackathon beneath the Base44 SideQuest Corgi thank you slide',
        expectedFilenames: ['DSC07062.jpg'],
      },
      {
        id: 'jackpot-organizers',
        title: 'The organizing team',
        caption: 'Celebrating with the core organizing team after closing demos at the Jackpot Hackathon.',
        alt: 'Four organizers posing in front of the Base44, SideQuest, and Corgi thank you projection',
        expectedFilenames: ['DSC07088.jpg'],
      },
      {
        id: 'jackpot-waypoint',
        title: 'Live product demos',
        caption: 'Teams pitching shipped builds like Waypoint during the hackathon showcase.',
        alt: 'Participants watching a live Waypoint demo presentation projected on the main screen',
        expectedFilenames: ['DSC06870.jpg'],
      },
      {
        id: 'jackpot-building',
        title: 'Heads-down building',
        caption: 'Yale builders prototyping together at tables throughout the hackathon.',
        alt: 'Hackathon participants in Tsai CITY hoodies coding together at tables',
        expectedFilenames: ['DSC06836.jpg'],
      },
    ],
    thoughtStory: {
      spark: 'Curious builders ship faster when they have a room full of peers shipping beside them.',
      tried: 'Grew SideQuest Yale to 300+ members and organized the Jackpot Hackathon with Base44 and Corgi.',
      next: 'Hosting more build nights and hackathons where anyone at Yale can launch something real.',
    },
  },
  {
    id: 'education',
    index: 3,
    label: 'Four-Campus Education',
    subtitle: 'Yale SOM · INSEAD · Berkeley · ESSEC',
    xPercent: 22,
    yPercent: 44,
    color: '#a8bcd9',
    summary:
      'A dual-degree journey across France, Singapore, California, and New Haven—connecting business strategy, AI engineering, and hands-on product building.',
    ctaLabel: 'View full academic timeline',
    targetRoute: 'resume',
    featuredCaseIds: [],
    highlights: [
      {
        label: 'Yale School of Management',
        value: 'MMS in Global Business and Society (May 2027) · Founder of NightShift AI & SideQuest Yale',
      },
      {
        label: 'INSEAD',
        value: 'Master in Management (Jan 2027) · Sole INSEAD selectee for the Yale dual degree',
      },
      {
        label: 'UC Berkeley',
        value: 'Innovation Management Exchange Program (2024) · Silicon Valley tech commercialization',
      },
      {
        label: 'ESSEC Business School',
        value: 'Global Bachelor of Business Administration (2024) · France & Singapore',
      },
    ],
    photoSlots: [
      {
        id: 'yale-som',
        title: 'Yale School of Management',
        caption: 'At 165 Whitney Ave — Yale School of Management in New Haven.',
        alt: 'Nishtha standing beside the Yale University School of Management sign at 165 Whitney Ave',
        expectedFilenames: ['PHOTO-2026-09-12-00-15-26.jpg'],
      },
      {
        id: 'insead-snow',
        title: 'INSEAD in winter snow',
        caption: 'Snowfall on the INSEAD campus in Fontainebleau, France.',
        alt: 'Nishtha smiling outdoors in the snow outside the INSEAD campus building',
        expectedFilenames: ['PHOTO-2026-01-07-04-12-24.jpg', 'WhatsApp Image 2026-05-26 at 00.05.39.jpeg'],
      },
      {
        id: 'essec-graduation',
        title: 'ESSEC Business School graduation',
        caption: 'ESSEC graduation in black academic gown and emerald hood.',
        alt: 'Nishtha in ESSEC Business School graduation cap, black gown, and teal-emerald hood',
        expectedFilenames: ['IMG_5791 2.JPG', 'IMG_5791.JPG'],
      },
    ],
    thoughtStory: {
      spark: 'Studying across continents changes how you spot opportunities and build with diverse teams.',
      tried: 'Graduated from ESSEC, exchanged at UC Berkeley, joined INSEAD’s MiM, and earned the sole INSEAD–Yale SOM seat.',
      next: 'Combining AI software coursework at Yale with real-world product launches.',
    },
  },
  {
    id: 'useful-ai',
    index: 4,
    label: 'Applied AI Craft',
    subtitle: 'Human-centered AI tools',
    xPercent: 18,
    yPercent: 20,
    color: '#b7c2e6',
    summary:
      'Small, sharp tools where AI removes everyday friction while keeping human judgement in charge—from GPT-4o vision closets to daily research agents.',
    ctaLabel: 'Open GTM Prospect Finder',
    targetRoute: 'case',
    targetId: 'gtm-prospect-finder',
    featuredCaseIds: ['aditis-wardrobe', 'gtm-prospect-finder'],
    workHighlights: [
      {
        title: 'HYFIN · Green Finance AI Agent',
        role: 'GTM Product Associate · San Francisco',
        summary:
          'Built an AI agent to scrape and summarize daily green finance news across 10 Asian markets into ClickUp, cutting manual research by 10+ hours/week.',
      },
    ],
    thoughtStory: {
      spark: 'Everyday friction is the clearest starting point for useful AI.',
      tried: 'Shipped Aditi’s Wardrobe with GPT-4o vision tagging and a 2-day AI outreach prep MVP.',
      next: 'Exploring where automation accelerates work—and where human judgement stays essential.',
    },
  },
  {
    id: 'product-building',
    index: 5,
    label: 'Zero-to-One Builds',
    subtitle: 'Shipping for real people',
    xPercent: 34,
    yPercent: 62,
    color: '#c8b8e8',
    summary:
      'Start with someone real, listen until the bottleneck is obvious, and ship an interface they actually want to open.',
    ctaLabel: 'Explore Aditi’s Wardrobe',
    targetRoute: 'case',
    targetId: 'aditis-wardrobe',
    featuredCaseIds: ['aditis-wardrobe', 'hoarding-wind-simulator', 'loreal-brandstorm'],
    thoughtStory: {
      spark: 'One real person’s problem is sharper than an abstract market thesis.',
      tried: 'Built a digital closet for my mom, a 3D wind proxy simulator for my dad, and an NFC fragrance experience.',
      next: 'Tightening feedback loops between real-world testing and shipped iterations.',
    },
  },
  {
    id: 'gtm-growth',
    index: 6,
    label: 'Signal-Led Growth',
    subtitle: 'Right message, right moment',
    xPercent: 80,
    yPercent: 50,
    color: '#b4c0df',
    summary:
      'Combining public buying signals, waterfall enrichment, and clear messaging so outbound feels timely rather than automated noise.',
    ctaLabel: 'Explore Climate SaaS Blueprint',
    targetRoute: 'case',
    targetId: 'climate-outreach',
    featuredCaseIds: ['climate-outreach', 'gtm-prospect-finder'],
    workHighlights: [
      {
        title: 'HYFIN · Automated Outbound Engine',
        role: 'Airtable · Clay · n8n · Lemlist',
        summary:
          'Drove 40% faster sourcing and a 35% reply rate on China manufacturer outreach while guarding smaller-lender data quality.',
      },
      {
        title: 'NIKA.ECO · Nika Planet GTM Launch',
        role: 'Product Marketing & Growth Lead · Singapore',
        summary:
          'Improved lead-to-customer conversion by 15%, inbound inquiries by 20%, and closed the first paying customer in one week.',
      },
    ],
    thoughtStory: {
      spark: 'Relevance depends on timing and specificity, not outbound volume.',
      tried: 'Engineered signal-based workflows with Clay, n8n, Lemlist, and HubSpot across Europe and Asia.',
      next: 'Testing which public triggers convert into high-trust enterprise conversations.',
    },
  },
  {
    id: 'climate-tech',
    index: 7,
    label: 'Climate & Capital',
    subtitle: 'Green compute, risk & climate finance',
    xPercent: 76,
    yPercent: 76,
    color: '#a7c4c2',
    summary:
      'My current research explores the green compute space and how university data clusters can operate sustainably—alongside climate finance, carbon accounting, and geospatial risk products.',
    ctaLabel: 'Explore Climate SaaS Case Study',
    targetRoute: 'case',
    targetId: 'climate-outreach',
    featuredCaseIds: ['climate-outreach'],
    workHighlights: [
      {
        title: 'Yale Research · Green Compute & University Clusters',
        role: 'Current Research · Yale School of Management',
        summary:
          'Investigating how university compute clusters measure, schedule, and reduce energy intensity across academic AI and research workloads.',
      },
      {
        title: 'CLEARCARBON · Emissions Tools for Asian SMEs',
        role: 'Cofounder, Head of GTM & Product Marketing · Singapore / France',
        summary:
          'Interviewed 20+ manufacturers and repositioned messaging from emissions tracking to cost savings around EU carbon rules.',
      },
      {
        title: 'HYFIN · Clean Energy Loans in Asia',
        role: 'GTM Product Associate · San Francisco',
        summary:
          'Automated outbound to 50 target climate-finance accounts and built an automated Asian green-finance intelligence feed.',
      },
      {
        title: 'NIKA.ECO · Geospatial Climate Risk',
        role: 'Product Marketing & Growth Lead · Singapore',
        summary:
          'Led the Nika Planet GTM launch and drove +15% lead-to-customer conversion via A/B messaging tests.',
      },
    ],
    thoughtStory: {
      spark: 'AI infrastructure and climate technology both succeed when sustainability aligns with operational efficiency.',
      tried: 'Worked across climate finance (Hyfin), carbon SaaS (ClearCarbon), and geospatial risk (Nika.eco); now researching green compute at Yale.',
      next: 'Mapping how university data clusters can become models for low-carbon compute.',
    },
  },
  {
    id: 'family-twin',
    index: 8,
    label: 'Twin Sister & Family',
    subtitle: 'Built for Mom, Dad & Roots',
    xPercent: 19,
    yPercent: 74,
    color: '#d1bcd9',
    summary:
      'I’m a twin, love social rooms, and rely on wit and humor to break the ice—while my twin sister, my parents, and my brother keep me grounded and inspire half the products I build.',
    ctaLabel: 'Open Aditi’s Wardrobe',
    targetRoute: 'case',
    targetId: 'aditis-wardrobe',
    featuredCaseIds: ['aditis-wardrobe', 'hoarding-wind-simulator'],
    photoSlots: [
      {
        id: 'twin-birthday',
        title: 'Birthday with my twin sister',
        caption: 'Smiling over birthday dessert and a lit candle with my twin sister.',
        alt: 'Nishtha and her twin sister smiling beside a birthday dessert with a lit candle',
        expectedFilenames: ['WhatsApp Image 2026-05-24 at 19.24.31.jpeg'],
      },
      {
        id: 'twin-fontainebleau',
        title: 'Fontainebleau with my twin',
        caption: 'Twin selfie outside the Château de Fontainebleau in France.',
        alt: 'Nishtha and her twin sister smiling in front of Château de Fontainebleau',
        expectedFilenames: ['WhatsApp Image 2026-05-26 at 00.13.56.jpeg'],
      },
      {
        id: 'twin-evening',
        title: 'Evening celebration in France',
        caption: 'Dressed up with my twin sister and friend for an evening out.',
        alt: 'Nishtha, her twin sister, and a friend dressed up outdoors in France',
        expectedFilenames: ['WhatsApp Image 2026-05-26 at 00.12.55.jpeg'],
      },
      {
        id: 'family-celebration',
        title: 'Family wedding celebration',
        caption: 'With my twin sister, brother, and family dressed up beneath hanging pink flowers.',
        alt: 'Nishtha, her twin sister, her brother, and bride smiling beneath floral wedding decor',
        expectedFilenames: ['WhatsApp Image 2026-05-26 at 00.31.43.jpeg'],
      },
      {
        id: 'parents-insead',
        title: 'Parents visiting INSEAD',
        caption: 'My parents and me standing outside the INSEAD campus sign in Fontainebleau.',
        alt: 'Nishtha with both parents in front of the brick INSEAD The Business School for the World sign',
        expectedFilenames: ['WhatsApp Image 2026-05-26 at 00.25.13 (1).jpeg'],
      },
      {
        id: 'mom-france',
        title: 'Walks with Mom',
        caption: 'Strolling with my mom along a tree-lined avenue in France.',
        alt: 'Nishtha and her mother smiling on a tree-lined avenue in France',
        expectedFilenames: ['WhatsApp Image 2026-05-26 at 00.02.48.jpeg'],
      },
      {
        id: 'brother-carousel',
        title: 'Carousel ride with my brother',
        caption: 'On the carousel with my brother.',
        alt: 'Nishtha wearing Minnie Mouse ears and smiling with her brother on a carousel',
        expectedFilenames: ['WhatsApp Image 2026-05-26 at 00.01.51.jpeg'],
      },
    ],
    thoughtStory: {
      spark: 'Having a twin sister gives you a lifelong teammate, sounding board, and mirror.',
      tried: 'Built Aditi’s Wardrobe for my mom’s 100+ sarees and the 3D Wind Stress Simulator for my dad’s Mumbai business.',
      next: 'Keeping ambition anchored in warmth, loyalty, and family.',
    },
  },
  {
    id: 'travel',
    index: 9,
    label: 'Passport & Travel',
    subtitle: 'Maps · Strange Pictures · Alps & Lisbon',
    xPercent: 49,
    yPercent: 80,
    color: '#aebfd9',
    summary:
      'Avid traveler, reader, and map collector—carrying stories from Chamonix and Lisbon alongside favorite maps from The Land of Kids in Aspen and the UC Berkeley library, plus my recent favorite book Strange Pictures.',
    ctaLabel: 'See global experience on Resume',
    targetRoute: 'resume',
    featuredCaseIds: [],
    workHighlights: [
      {
        title: 'Map Collection Favorites',
        role: 'Aspen & Berkeley',
        summary:
          'I love collecting paper maps wherever I explore—especially The Land of Kids map from Aspen and the UC Berkeley library map.',
      },
      {
        title: 'Recent Read · Strange Pictures',
        role: 'Bookshop & late-night reading',
        summary:
          'Recently finished Strange Pictures and loved how every clue layers into a larger visual puzzle.',
      },
    ],
    photoSlots: [
      {
        id: 'chamonix-alps',
        title: 'Chamonix · French Alps',
        caption: 'In front of the snow-capped Mont Blanc range in Chamonix with my parents.',
        alt: 'Nishtha and her parents in front of snow-capped Alpine peaks in Chamonix',
        expectedFilenames: ['WhatsApp Image 2026-05-26 at 00.25.13.jpeg'],
      },
      {
        id: 'lisbon-seafood',
        title: 'Lisbon by the water',
        caption: 'Coastal seafood lunch on a sunny afternoon in Lisbon.',
        alt: 'Nishtha at a waterfront seafood restaurant in Lisbon',
        expectedFilenames: ['WhatsApp Image 2026-05-25 at 23.31.19.jpeg'],
      },
      {
        id: 'europe-dinner',
        title: 'Shared tables with friends',
        caption: 'Warm dinner table and late-night conversation with friends on a weekend trip.',
        alt: 'Nishtha and friends smiling together at a colorful restaurant dinner table',
        expectedFilenames: ['WhatsApp Image 2026-05-25 at 23.20.31.jpeg'],
      },
    ],
    thoughtStory: {
      spark: 'Living across Mumbai, Singapore, France, Berkeley, and New Haven makes maps and stories feel personal.',
      tried: 'Collected maps from Aspen to UC Berkeley, hiked the French Alps, and read mysteries like Strange Pictures between flights.',
      next: 'Adding New England trails and more independent bookshops to the collection.',
    },
  },
];

export const RESUME_DATA = {
  name: 'Nishtha Bahal',
  intro:
    'At the intersection of creativity, product, and growth—Global Business & Society at Yale SOM, previously INSEAD & UC Berkeley.',
  email: 'nishtha.bahal@yale.edu',
  linkedin: 'https://linkedin.com/in/nishthabahal',
  phone: '+1 (203) 654 5947',
  pdfUrl: '/resume/Nishtha-Bahal-Resume.pdf',
  experience: [
    {
      company: 'HYFIN',
      role: 'GTM Product Associate',
      date: 'June–September 2026',
      location: 'San Francisco, CA',
      context: 'Climate finance startup funding clean energy loans in Asia',
      bullets: [
        'Drove 40% faster prospect sourcing and reached 100+ decision makers at 50 target customers by automating the company’s first end-to-end outreach loop using Airtable, Clay, n8n, and Lemlist.',
        'Achieved a 35% reply rate on China tour outreach to 25+ manufacturers using Clay’s waterfall enrichment.',
        'Built an AI agent to scrape and summarize daily green finance news across 10 Asian markets into ClickUp, cutting manual research by 10+ hours per week.',
        'Evaluated Clay data coverage across 20 financial institutions, identified unreliable enrichment and confidence signals for smaller lenders, and established manual-research guardrails to protect campaign quality.',
      ],
    },
    {
      company: 'CLEARCARBON',
      role: 'Cofounder, Head of GTM and Product Marketing',
      date: 'April–September 2026',
      location: 'Singapore / France',
      context: 'Emissions data tools for Asian SMEs',
      bullets: [
        'Repositioned messaging from emissions tracking to a cost-savings offer, informed by 20+ customer interviews with manufacturers and enterprise buyers.',
        'Defined the ideal customer profile by leading willingness-to-pay tests across 3 segments affected by new EU carbon rules.',
      ],
    },
    {
      company: 'NEGEN CAPITAL',
      role: 'Market Research & Valuation Analyst',
      date: 'March–June 2025',
      location: 'Mumbai, India',
      context: 'Special situations investment fund',
      bullets: [
        'Influenced $6M+ in portfolio reallocations by analyzing 40+ earnings calls and benchmarking holdings against global peers.',
        'Uncovered investment opportunities with 100%+ upside by authoring 10+ research reports built on valuation models.',
      ],
    },
    {
      company: 'NIKA.ECO',
      role: 'Product Marketing & Growth Lead',
      date: 'August–December 2024',
      location: 'Singapore',
      context: 'Geospatial climate risk analytics platform',
      bullets: [
        'Improved lead-to-customer conversion by 15% and inbound inquiries by 20% through A/B tests on audience segments, messaging, and calls to action.',
        'Led the go-to-market launch of Nika Planet through Mailchimp campaigns and thought-leadership content, generating its first paying customer within one week.',
      ],
    },
  ],
  education: [
    {
      school: 'Yale School of Management',
      degree: 'Master of Management Studies Candidate, Global Business and Society',
      date: 'May 2027',
      location: 'New Haven, CT',
      bullets: [
        'Coursework: Analytics in the Age of AI, Management of Software Development, AI Applications, LLMs.',
        'Research: Green compute infrastructure and how university data clusters can operate more sustainably.',
        'Founder of NightShift AI, part of the Launchpad program at Tsai CITY, Yale’s startup incubator.',
        'Founder and President of SideQuest Yale, a builder community.',
      ],
    },
    {
      school: 'INSEAD',
      degree: 'Master in Management',
      date: 'January 2027',
      location: 'France / Singapore',
      bullets: [
        'Selected as the sole INSEAD student for the Yale dual degree; founded Entrepreneurs@INSEAD and Women’s Mentorship.',
      ],
    },
    {
      school: 'University of California, Berkeley',
      degree: 'Innovation Management Exchange Program',
      date: '2024',
      location: 'Berkeley, CA',
      bullets: ['Silicon Valley technology commercialization.'],
    },
    {
      school: 'ESSEC Business School',
      degree: 'Global Bachelor of Business Administration',
      date: '2024',
      location: 'France / Singapore',
      bullets: [],
    },
  ],
  skills: [
    {
      label: 'Data analysis',
      value: 'SQL, Python, Excel, A/B testing, experiment design, survey design, audience segmentation.',
    },
    {
      label: 'Marketing automation & AI',
      value: 'Clay, Airtable, Lemlist, Apollo, Hunter.io, n8n, Claude agents, Cursor, Lovable, Supabase.',
    },
    {
      label: 'Languages',
      value: 'English, Hindi, French (intermediate).',
    },
    {
      label: 'Interests & fun facts',
      value:
        'Basketball (state level), Indian classical dance, twin sister, map collecting (Land of Kids in Aspen & UC Berkeley library), Strange Pictures.',
    },
  ],
};
