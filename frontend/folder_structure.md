
├── 📁 app/
│   ├── layout.tsx                        # Root layout with fonts and providers
│   ├── page.tsx                          # Home page (/)
│   ├── globals.css                       # Global styles and Tailwind CSS
│   │
│   ├── 📁 practice/
│   │   ├── layout.tsx                    # Practice section layout
│   │   ├── page.tsx                      # Practice selection page (/practice)
│   │   ├── loading.tsx                   # Loading state for practice pages
│   │   ├── error.tsx                     # Error boundary for practice
│   │   │
│   │   ├── 📁 [id]/
│   │   │   └── page.tsx                  # Dynamic scenario page (/practice/[id])
│   │   │
│   │   └── 📁 custom/
│   │       └── page.tsx                  # Custom role-play page (/practice/custom)
│   │
│   ├── 📁 pulse-check/
│   │   ├── layout.tsx                    # Pulse check layout
│   │   ├── page.tsx                      # Pulse survey page (/pulse-check)
│   │   └── loading.tsx                   # Loading state
│   │
│   ├── 📁 agreements/
│   │   ├── layout.tsx                    # Agreements layout
│   │   ├── page.tsx                      # Team agreements page (/agreements)
│   │   ├── loading.tsx                   # Loading state
│   │   │
│   │   └── 📁 [id]/
│   │       ├── page.tsx                  # Individual agreement (/agreements/[id])
│   │       └── edit/
│   │           └── page.tsx              # Edit agreement (/agreements/[id]/edit)
│   │
│   ├── 📁 dashboard/
│   │   ├── layout.tsx                    # Dashboard layout with sidebar
│   │   ├── page.tsx                      # Main dashboard (/dashboard)
│   │   ├── loading.tsx                   # Loading state
│   │   │
│   │   ├── 📁 analytics/
│   │   │   └── page.tsx                  # Analytics view (/dashboard/analytics)
│   │   │
│   │   ├── 📁 team/
│   │   │   └── page.tsx                  # Team overview (/dashboard/team)
│   │   │
│   │   └── 📁 reports/
│   │       └── page.tsx                  # Reports section (/dashboard/reports)
│   │
│   ├── 📁 api/
│   │   ├── 📁 voice/
│   │   │   ├── route.ts                  # POST /api/voice - Process voice input
│   │   │   └── transcribe/
│   │   │       └── route.ts              # POST /api/voice/transcribe
│   │   │
│   │   ├── 📁 feedback/
│   │   │   ├── route.ts                  # GET/POST /api/feedback
│   │   │   └── analyze/
│   │   │       └── route.ts              # POST /api/feedback/analyze
│   │   │
│   │   ├── 📁 pulse/
│   │   │   ├── route.ts                  # GET/POST /api/pulse
│   │   │   └── [id]/
│   │   │       └── route.ts              # GET/PUT /api/pulse/[id]
│   │   │
│   │   └── 📁 scenarios/
│   │       ├── route.ts                  # GET /api/scenarios
│   │       └── [id]/
│   │           └── route.ts              # GET /api/scenarios/[id]
│   │
│   └── 📁 (auth)/
│       ├── login/
│       │   └── page.tsx                  # Login page
│       └── register/
│           └── page.tsx                  # Registration page
│
├── 📁 components/
│   ├── 📁 ui/                            # Shared UI components
│   │   ├── button.tsx                    # Reusable button component
│   │   ├── card.tsx                      # Card component
│   │   ├── dialog.tsx                    # Modal/dialog component
│   │   ├── input.tsx                     # Form input component
│   │   ├── select.tsx                    # Dropdown select component
│   │   ├── badge.tsx                     # Badge/tag component
│   │   └── progress.tsx                  # Progress bar component
│   │
│   ├── 📁 layout/
│   │   ├── header.tsx                    # App header with navigation
│   │   ├── footer.tsx                    # App footer
│   │   ├── sidebar.tsx                   # Dashboard sidebar
│   │   └── mobile-nav.tsx                # Mobile navigation menu
│   │
│   ├── 📁 voice/
│   │   ├── voice-card.tsx                # Conversation card with voice I/O
│   │   ├── microphone-button.tsx         # Recording control
│   │   ├── model-selector.tsx            # AI model selection
│   │   ├── transcript-display.tsx        # Transcript viewer
│   │   └── audio-player.tsx              # Audio playback
│   │
│   ├── 📁 simulation/
│   │   ├── scenario-list.tsx             # Scenario cards grid
│   │   ├── conversation-timeline.tsx     # Conversation flow
│   │   ├── feedback-panel.tsx            # Real-time coaching
│   │   ├── role-play-setup.tsx           # 6-step wizard
│   │   └── cultural-coaching-panel.tsx   # Cultural guidance
│   │
│   ├── 📁 pulse/
│   │   ├── pulse-form.tsx                # Survey form
│   │   ├── pulse-summary.tsx             # Results summary
│   │   └── pulse-chart.tsx               # Trend visualization
│   │
│   ├── 📁 agreements/
│   │   ├── agreement-list.tsx            # Agreements grid
│   │   ├── agreement-editor.tsx          # Create/edit form
│   │   └── agreement-card.tsx            # Individual agreement display
│   │
│   └── 📁 dashboard/
│       ├── stats-cards.tsx               # KPI metric cards
│       ├── risk-flags.tsx                # Risk indicators
│       ├── activity-feed.tsx             # Recent activities
│       └── team-health-chart.tsx         # Team metrics visualization
│
├── 📁 lib/
│   ├── 📁 services/
│   │   ├── data-service.ts               # Data access layer
│   │   ├── voice-service.ts              # Voice processing
│   │   ├── feedback-service.ts           # Feedback analysis
│   │   └── cultural-service.ts           # Cultural adaptations
│   │
│   ├── 📁 hooks/
│   │   ├── use-voice-recorder.ts         # Voice recording hook
│   │   ├── use-scenario.ts               # Scenario data hook
│   │   ├── use-pulse-data.ts             # Pulse analytics hook
│   │   └── use-cultural-context.ts       # Cultural context hook
│   │
│   ├── 📁 utils/
│   │   ├── cn.ts                         # Class name utility
│   │   ├── format.ts                     # Formatting helpers
│   │   ├── validation.ts                 # Form validation
│   │   └── cultural-adapter.ts           # Cultural adaptations
│   │
│   └── 📁 types/
│       ├── index.ts                      # Shared type definitions
│       ├── scenario.ts                   # Scenario types
│       ├── feedback.ts                   # Feedback types
│       ├── cultural.ts                   # Cultural context types
│       └── voice.ts                      # Voice/audio types
│
├── 📁 data/
│   ├── config.json                       # App configuration
│   ├── scenarios.json                    # Practice scenarios
│   ├── pulse-questions.json              # Survey questions
│   ├── team-agreements.json              # Agreement templates
│   └── cultural-contexts.json            # Cultural data
│
├── 📁 public/
│   ├── 📁 audio/                         # Demo audio files
│   ├── 📁 images/                        # Images and icons
│   └── 📁 fonts/                         # Custom fonts (if any)
│
├── 📁 prisma/                            # Database schema (future)
│   ├── schema.prisma                     # Prisma schema
│   └── seed.ts                           # Database seeding
│
├── 📄 Root Configuration Files
│   ├── next.config.js                    # Next.js configuration
│   ├── tailwind.config.ts                # Tailwind configuration
│   ├── tsconfig.json                     # TypeScript configuration
│   ├── package.json                      # Dependencies
│   ├── .env.local                        # Environment variables
│   ├── .env.example                      # Environment template
│   ├── middleware.ts                     # Next.js middleware
│   └── README.md                         # Documentation
│
