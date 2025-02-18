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
- Photo attachment capability
- "Inbox Zero" approach with unannotated/annotated tabs
- QR code generation for easy sharing
- Location data to track where leads were collected

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
   - Attach photos
   - Track which leads still need follow-up

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
   - Attach any relevant photos
   - Mark as annotated when done

### Voice Notes
- Uses Deepgram for accurate transcription
- Supports multiple languages
- Transcripts are automatically added to notes
- Original audio is preserved and playable

### Photos
- Can attach multiple photos per lead
- Good for business cards, whiteboard discussions, etc.
- Photos are stored securely in Firebase

## 🔐 Security & Privacy

- Email is the only required field
- Location tracking is optional
- Data is stored securely in Firebase
- Admin access is restricted
- Photos and voice notes are stored in private storage

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

## 🆘 Troubleshooting

- If QR code isn't scanning, ensure good lighting
- Voice notes require microphone permissions
- Photos require camera/gallery permissions
- Location tracking requires location permissions
- Check browser compatibility if issues persist

## 🔄 Updates & Maintenance

The system is built with:
- Next.js 15+
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Firebase/Firestore
- Deepgram API

To deploy updates:
1. Test changes locally
2. Commit and push to main
3. Vercel will auto-deploy

## 📞 Support

For technical issues or feature requests, contact the development team.

## 📋 Upcoming Features

- [ ] Automated email follow-ups to leads
- [ ] Perplexity AI integration for lead research and insights

---

Built with ❤️ for the BitMind team
