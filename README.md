# Health Tech Career Roadmaps

Research-backed career transition guides for healthcare professionals (nurses, pharmacists, clinicians) moving into health tech roles. Built by a pharmacist who made the switch.

**Live site:** [roadmaps.tarvra.com](https://roadmaps.tarvra.com)

## What This Is

A free, open-source platform with detailed career roadmaps for mid-career healthcare professionals navigating the transition into health tech. Each roadmap follows a standardized 7-section framework grounded in real job posting analysis, verified certifications, and published transition stories.

### Available Roadmaps

| Role | Difficulty | Timeline |
|------|-----------|----------|
| Clinical Data Analyst | Moderate | 3–6 months |
| Health Informatics Analyst | Moderate | 3–6 months |
| EHR Implementation Specialist | Low | 1–3 months |
| Health Tech Product Manager | High | 6–12 months |
| Healthcare AI/ML Engineer | Very High | 12–18 months |

### The 7-Section Framework

Every roadmap covers:

1. **Role Snapshot** — What the role involves, demand signals, and why clinical experience is an advantage
2. **What You Already Have** — Skill translations for nurses, pharmacists, and other clinicians
3. **The Learning Path** — Phased curriculum with free/paid resources, time estimates, and checkpoints
4. **Certifications** — Which certs actually appear in job postings, rated by signal strength
5. **Portfolio Projects** — Hands-on projects that leverage your clinical background
6. **Real Transition Stories** — Verified examples of clinicians who made this transition
7. **First Three Moves** — Three actions you can take this week to start

## Tech Stack

- **Framework:** [Astro 5](https://astro.build) (static site generation + server routes)
- **UI:** [React 19](https://react.dev) (interactive components) + [Tailwind CSS 4](https://tailwindcss.com)
- **Email:** [Resend](https://resend.com) (action kit delivery + audience management)
- **Deployment:** [Vercel](https://vercel.com) (serverless)
- **Content:** JSON files — no CMS, no database

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

### Setup

```bash
# Clone the repo
git clone https://github.com/ehoneahobed/healthtech-roadmaps.git
cd healthtech-roadmaps

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Resend credentials (see below)

# Start the dev server
pnpm dev
```

The site will be running at `http://localhost:4321`.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | API key from [resend.com/api-keys](https://resend.com/api-keys) |
| `RESEND_AUDIENCE_ID` | No | Audience ID for email list management |
| `FROM_EMAIL` | No | Verified sender email (defaults to `hello@ehoneahobed.com`) |

The email capture feature works without these configured — the site runs fine, but the subscribe endpoint will return an error.

### Scripts

```bash
pnpm dev       # Start development server
pnpm build     # Build for production
pnpm preview   # Preview production build locally
```

## Project Structure

```
src/
├── pages/
│   ├── index.astro              # Homepage — roadmap directory
│   ├── r/[slug].astro           # Dynamic roadmap detail pages
│   └── api/subscribe.ts         # Email capture API (server-side)
├── components/
│   ├── EmailCapture.tsx          # React email signup form
│   └── SEOHead.astro             # Open Graph, Twitter Cards, JSON-LD
├── layouts/
│   └── BaseLayout.astro          # Shared header/footer layout
├── content/
│   ├── schema.ts                 # TypeScript interfaces
│   └── roadmaps/*.json           # Roadmap content files
├── lib/
│   └── roadmaps.ts               # Content loading utilities
└── styles/
    └── global.css                # Tailwind theme + global styles

public/
├── robots.txt
├── llms.txt                      # LLM-readable site overview
└── llms-full.txt                 # Full content for LLM consumption
```

## Adding a New Roadmap

1. Create a new JSON file in `src/content/roadmaps/` following the schema in `src/content/schema.ts`
2. Use an existing roadmap (e.g., `clinical-data-analyst.json`) as a template
3. Set `"status": "published"` and assign an `"order"` value
4. Run `pnpm build` — Astro auto-generates the page at `/r/your-slug`

No code changes needed. The homepage and routing pick up new roadmaps automatically.

## Contributing

Contributions are welcome! Here are some ways to help:

- **Add a new roadmap** — Research a health tech role and create a roadmap JSON file
- **Update existing content** — Fix outdated resources, add new certifications, update job market data
- **Submit transition stories** — Know someone who made the switch? Add their story
- **Improve the UI** — Accessibility improvements, mobile experience, new features
- **Fix bugs** — Check the issues tab

### Content Contribution Guidelines

Roadmap content should be:
- **Research-backed** — Cite job postings, industry reports, or verified sources
- **Actionable** — Include specific resources, timelines, and next steps
- **Clinician-friendly** — Translate tech jargon into clinical context
- **Current** — Include the date of last update

## Related Resources

- [The Transmutation Newsletter](https://thetransmutation.substack.com) — Weekly newsletter for healthcare professionals transitioning to tech
- [Career Quiz](https://quiz.ehoneahobed.com) — 3-minute quiz to find your best-fit health tech role
- [Health Tech Career Reports](https://ehoneahobed.gumroad.com) — In-depth research reports

## License

This project is open source under the [MIT License](LICENSE).

## Author

**Ehoneah Obed** — Pharmacist turned tech strategist. Building tools to help healthcare professionals navigate career transitions.

- Website: [ehoneahobed.com](https://ehoneahobed.com)
- Newsletter: [The Transmutation](https://thetransmutation.substack.com)
