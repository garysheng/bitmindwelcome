# BitMind Welcome Page

A digital business card collection system built for ETHDenver and other events. This system helps the BitMind team collect and manage leads efficiently while maintaining a personal touch.

## 🎯 Key Features

### For Event Attendees
- Quick and easy form to share contact information
- Progressive form that starts with just email
- Optional fields for name, organization, and X handle
- Location tracking to help remember where you met
- Space for notes about discussion topics
- Mobile-optimized interface
- Dark mode design

### For BitMind Team
- Admin dashboard to manage and annotate leads
- Voice notes with automatic transcription
- Photo attachment capability for business cards and whiteboard discussions
- "Inbox Zero" approach with unannotated/annotated tabs
- QR code generation for easy sharing
- Location data to track where leads were collected
- AI-powered lead analysis with X profile research

## 🚀 Quick Start for Team Members

1. When meeting someone at ETHDenver:
   ```
   https://irl.bitmind.ai?teammate=ken
   ```
   Replace `ken` with your identifier. This pre-fills your name in the form.

2. To show your QR code:
   ```
   https://irl.bitmind.ai/qr
   ```
   Keep this page open on your phone for quick scanning.

3. To review and annotate leads:
   ```
   https://irl.bitmind.ai/admin
   ```
   Here you can:
   - See all leads sorted by newest first
   - Add text notes
   - Record voice notes (automatically transcribed)
   - Attach photos (business cards, whiteboard discussions)
   - Track which leads still need follow-up
   - View AI analysis of leads including X profile research

## 🛠 Technical Setup

1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.local.example` to `.env.local` and fill in:
   ```bash
   cp .env.local.example .env.local
   ```
   Required environment variables:
   - Firebase configuration
   - Deepgram API key for voice transcription
   - Perplexity API key for AI lead analysis

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📱 Usage Tips

### At Events
1. Keep the QR code page open on your phone
2. When someone scans, they'll see your name on the form
3. Location is automatically captured when they submit
4. They can skip any field except email

### Lead Management
1. Check the admin page regularly
2. Start with the "Unannotated" tab
3. For each lead:
   - Add notes about your conversation
   - Record voice notes for quick capture
   - Attach photos of business cards or whiteboard discussions
   - Review AI analysis for insights from their X profile
   - Mark as annotated when done

### Photo Best Practices
- Take clear, well-lit photos of business cards
- For whiteboard discussions:
  - Ensure good contrast and lighting
  - Capture the entire context
  - Consider taking multiple angles
- Photos are automatically optimized and stored securely
- You can replace photos if needed by clicking the upload button again

### Voice Notes
- Uses Deepgram for accurate transcription
- Supports multiple languages
- Transcripts are automatically added to notes
- Original audio is preserved and playable

### AI Lead Analysis
- Automatically researches X profiles when provided
- Analyzes background and potential fit with BitMind
- Provides relevance score and suggested identities
- Suggests specific collaboration opportunities
- Updates in background after form submission

## 🔐 Security & Privacy

- Email is the only required field
- Location tracking is optional
- Data is stored securely in Firebase
- Admin access is restricted
- Photos and voice notes are stored in private storage
- AI analysis is performed securely

## 🤝 Team Member IDs
Current team member IDs for the `teammate` URL parameter:
- `ken` - Ken Miyachi
- Add more team members as needed

## 💡 Best Practices

1. Always use your teammate URL parameter
2. Annotate leads as soon as possible while memory is fresh
3. Use voice notes for detailed conversation records
4. Add photos of any drawings or materials discussed
5. Include context and next steps in your annotations
6. Review AI analysis for additional insights
7. Keep photos well-lit and clearly focused

## 🆘 Troubleshooting

- If QR code isn't scanning, ensure good lighting
- Voice notes require microphone permissions
- Photos require camera/gallery permissions
- Location tracking requires location permissions
- Check browser compatibility if issues persist
- If photos fail to upload, try:
  - Checking your internet connection
  - Ensuring the file is a supported image format
  - Reducing the file size if over 5MB

## 🔄 Updates & Maintenance

The system is built with:
- Next.js 15+
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Firebase/Firestore
- Deepgram API
- Perplexity API

To deploy updates:
1. Test changes locally
2. Commit and push to main
3. Vercel will auto-deploy

## 📞 Support

For technical issues or feature requests, contact the development team.

## 📋 Upcoming Features

- [ ] Automated email follow-ups to leads
- [ ] Enhanced AI analysis with company research
- [ ] Team collaboration features
- [ ] Analytics dashboard

---

Built with ❤️ for the BitMind team
