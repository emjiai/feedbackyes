# FeedBackYes™ Team App

An AI-powered, mobile-responsive platform that helps teams practice high-stakes workplace conversations across six core pillars: communication, collaboration, decision-making, values & culture, stress & wellbeing, and conflict management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd feedbackyes-team-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
/components
  /common         # Header, Footer, Sidebar
  /voice          # Voice components (VoiceCard, MicrophoneButton, etc.)
  /simulation     # Practice session components
  /pulse          # Pulse check survey components
  /agreement      # Team agreement components
  /dashboard      # Analytics and dashboard components

/pages            # Next.js pages
  /practice       # Practice scenario pages
  /pulse-check    # Weekly pulse check
  /agreements     # Team agreements
  /dashboard      # Team analytics dashboard

/data             # JSON data files
  config.json     # Brand settings, UI text, models
  scenarios.json  # Practice scenarios
  pulseQuestions.json  # Pulse survey questions
  teamAgreements.json  # Team agreement templates

/services         # Service layer
  dataService.ts  # Data access functions
  voiceService.ts # Voice API simulation

/styles           # Global styles
  globals.css     # Tailwind CSS and custom styles

/public          
  /audio         # Demo audio files

## 🎯 Features

### Core Functionality
- **Voice-First Practice Sessions**: Real-time voice conversations with AI role-play partners
- **Multi-Model Support**: Choose between OpenAI, Gemini, ElevenLabs, and open-source models
- **Real-Time Transcription**: Live transcription with multi-language support
- **Coaching Feedback**: Immediate suggestions for improving communication style
- **Pulse Checks**: Weekly team health surveys across six pillars
- **Team Agreements**: Collaborative space for documenting team norms and values
- **Analytics Dashboard**: Track progress and identify areas for improvement

### Six Core Pillars
1. 💬 **Communication** - Clear and effective communication
2. 🤝 **Collaboration** - Working together effectively
3. 🎯 **Decision Making** - Making informed choices
4. 🌟 **Values & Culture** - Aligning with organizational values
5. 🧘 **Stress & Wellbeing** - Managing stress and maintaining balance
6. ⚖️ **Conflict Management** - Resolving conflicts constructively

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: Google Fonts (Outfit)
- **Voice**: Web Audio API, MediaRecorder API (simulated)
- **Data**: JSON files (demo mode)

## 🎨 Customization

### White Labeling
All branding, colors, and UI text are configured in `/data/config.json`:

```json
{
  "brand": {
    "name": "Your Brand",
    "tagline": "Your Tagline",
    "colors": {
      "primary": "#6366f1",
      "secondary": "#8b5cf6"
    }
  }
}
```

### Adding Scenarios
Add new practice scenarios in `/data/scenarios.json`:

```json
{
  "id": "unique-id",
  "title": "Scenario Title",
  "pillar": "communication",
  "difficulty": "medium",
  "description": "Brief description",
  "context": "Detailed context"
}
```

### Voice Models
Configure available voice models in `/data/config.json`:

```json
{
  "models": [
    {
      "id": "openai",
      "name": "OpenAI GPT-4",
      "description": "Advanced language model",
      "default": true
    }
  ]
}
```

## 🔌 API Integration (Future)

The app is designed for easy backend integration:

1. **Voice APIs**: Replace `voiceService.ts` methods with actual API calls:
   - OpenAI Realtime API for speech-to-speech
   - ElevenLabs for voice synthesis
   - Google Cloud Speech-to-Text

2. **Database**: Replace JSON files with MongoDB or PostgreSQL:
   - User authentication
   - Session storage
   - Analytics data

3. **RAG Pipeline**: Implement retrieval-augmented generation:
   - Vector store (pgvector/Supabase)
   - Knowledge base integration
   - Context-aware responses

## 🚦 Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📱 Responsive Design

The app is fully responsive with breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- ARIA labels on all interactive elements
- High contrast mode support
- Screen reader compatible

## 🔒 Security Considerations

- Audio data is not persisted (demo mode)
- All data is stored locally in JSON files
- No external API calls in demo mode
- Content Security Policy headers recommended for production

## 📈 Future Enhancements

- [ ] Native mobile apps (React Native)
- [ ] Real voice API integration
- [ ] MongoDB/PostgreSQL backend
- [ ] User authentication (Auth0/Clerk)
- [ ] Team management features
- [ ] Advanced analytics
- [ ] Custom scenario authoring
- [ ] Voice cloning for realism
- [ ] VR/AR practice modes
- [ ] Integration with Slack/Teams
- [ ] Performance review preparation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

Copyright © 2025 FeedBackYes™. All rights reserved.

## 🆘 Support

For questions or issues, please contact the development team or open an issue in the repository.

---

Built with ❤️ for better workplace communication