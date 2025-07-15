# SG1 - AI German Learning System

An immersive, AI-driven German learning experience with sci-fi aesthetics and conversation-based interaction.

## 🚀 Quick Start

### 1. File Structure
```
├── index.html              # Main HTML structure
├── css/
│   ├── base.css            # Base styles & reset
│   ├── animations.css      # DNA & gradient animations  
│   └── components.css      # UI components & buttons
├── js/
│   ├── config.js           # Audio URLs & settings
│   ├── state.js            # Application state management
│   ├── audio.js            # Audio management system
│   ├── conversation.js     # Conversation flow & UI logic
│   └── main.js             # Application initialization
└── README.md               # This file
```

### 2. Local Development

**Start a local server:**
```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

**Access the app:**
- Desktop: http://localhost:8000
- Mobile: Use ngrok for external access

### 3. Mobile Testing Setup

**For external device testing:**
```bash
npx ngrok http 8000
# Use the provided https URL on mobile devices
```

**Important for iOS:**
- Must use HTTPS for audio to work
- All audio files are already hosted on HTTPS CDN
- Audio requires user interaction to unlock

## 🏗️ Architecture Overview

### Core Components

**Configuration (config.js)**
- Audio file URLs for each conversation step
- Application settings and timing
- Platform detection
- Personality profile templates

**State Management (state.js)**
- Current conversation step and user responses
- Audio playback state
- Progress tracking
- User scoring system

**Audio System (audio.js)**
- Cross-platform audio management
- iOS compatibility layer
- Background music control
- Web Audio API fallback

**Conversation Flow (conversation.js)**
- 12-step conversation progression (0-11)
- Dynamic UI display based on step
- User input handling and validation
- Personality analysis and scoring

**UI System (state.js + components.css)**
- DNA visualizer with animation states
- Responsive button and input components
- Progress tracking and state management

### Conversation Flow
```
Step 0:  Welcome → "Bereit" button
Step 1:  Why German? → Text input
Step 2:  Goals → Text input  
Step 3:  Time commitment → Text input
Step 4:  Success probability → Choice buttons
Step 5:  German love scale → 1-10 scale
Step 6:  Mother relationship → Text input
Step 7:  AI type selection → Choice buttons
Step 8-10: AI processing → Automatic progression
Step 11: Final confirmation → "Na gut" button
```

## 🔧 Development

### Key Files to Edit

**Audio Configuration**
- Edit `js/config.js` → `Config.audioFiles` to change audio URLs
- Edit `js/config.js` → `Config.settings` to change timing/behavior

**Conversation Flow**
- Edit `js/conversation.js` → `Conversation.showNextButton()` to change step logic
- Edit `js/conversation.js` → `DNAButton.*` methods to modify UI behavior

**Visual Styling**
- Edit `css/animations.css` for DNA visualizer changes
- Edit `css/components.css` for button/input styling
- Edit `css/base.css` for layout changes

**Application Logic**
- Edit `js/state.js` for state management changes
- Edit `js/audio.js` for audio behavior modifications

### Debug Tools

**Console Commands:**
```javascript
SG1Debug.state()           // View current state
SG1Debug.testAudio(0)      // Test audio for step 0
SG1Debug.skipTo(5)         // Jump to step 5
SG1Debug.showAll()         // Show all UI elements
SG1Debug.toggleMusic()     // Toggle background music
SG1Debug.reset()           // Reset to beginning
```

**State Inspection:**
```javascript
window.SG1State           // Application state
window.SG1Config          // Configuration
window.SG1UI              // UI controller
```

### Testing Checklist

**Desktop Testing:**
- [ ] Complete conversation flow (0-11)
- [ ] Audio playback for each step
- [ ] Button interactions and animations
- [ ] Background music and controls
- [ ] Skip and quit functionality
- [ ] Fullscreen mode

**Mobile Testing:**
- [ ] iOS Safari: Audio unlocking and playback
- [ ] Android Chrome: Full functionality
- [ ] Touch interactions and responsiveness
- [ ] Screen rotation handling
- [ ] Performance on slower devices

## 📱 Mobile Considerations

### iOS Audio Requirements
- Audio files must be HTTPS (✅ already configured)
- Audio creation must happen in user interaction handlers
- Background music requires separate handling
- Web Audio API provides better compatibility

### Android Compatibility
- Generally more permissive with audio
- Test on multiple Chrome versions
- Check performance on lower-end devices

## 🚀 Deployment

### GitHub Pages Setup
1. Push all files to your repository
2. Go to Settings → Pages
3. Select source: Deploy from branch `main`
4. Access via: `https://smartergerman.github.io/him/`

### Teachable Integration

**Option 1: Overlay Approach (Recommended)**
```html
<!-- In Teachable Custom Code Widget -->
<div id="sg1-overlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 999999; background: black;">
    <iframe src="https://smartergerman.github.io/him/" 
            width="100%" height="100%" frameborder="0"></iframe>
</div>

<button onclick="document.getElementById('sg1-overlay').style.display='block'">
    Launch SG1 Assessment
</button>

<script>
// Listen for completion message
window.addEventListener('message', function(event) {
    if (event.data.type === 'sg1-complete') {
        document.getElementById('sg1-overlay').style.display = 'none';
        // Mark Teachable lesson as complete
    }
});
</script>
```

### Performance Optimization

**Before deployment:**
- [ ] Test all audio URLs are accessible
- [ ] Verify HTTPS for all resources
- [ ] Test on multiple devices and browsers
- [ ] Check loading times and performance
- [ ] Validate responsive design

## 🐛 Troubleshooting

### Common Issues

**Audio not playing on mobile:**
- Check console for autoplay errors
- Ensure user has interacted with page first
- Test with `SG1Debug.testAudio(0)`

**UI elements not appearing:**
- Check `DNAButton.currentMode` in console
- Verify step progression with `SG1Debug.state()`
- Look for JavaScript errors in console

**Performance issues:**
- Disable hardware acceleration in CSS animations
- Check memory usage with `performance.memory`
- Test on slower devices

**Fullscreen not working:**
- Check browser permissions
- Test iframe integration approach
- Verify HTTPS hosting

### Debug Information

The app automatically logs platform information and provides debug tools. Check the browser console for:
- Platform detection results
- Audio capability detection
- Error messages and warnings
- State change notifications

## 📞 Support

For development questions or issues:
1. Check browser console for error messages
2. Use debug tools to inspect application state
3. Test on multiple devices and browsers
4. Refer to the comprehensive developer guide for detailed explanations

## 🔄 Updates

To update the application:
1. Modify the appropriate files
2. Test locally with development server
3. Push changes to GitHub repository
4. GitHub Pages will automatically deploy updates

---

**Last updated:** Current version  
**Browser Support:** Chrome, Safari, Firefox (mobile and desktop)  
**Dependencies:** None (vanilla HTML/CSS/JavaScript)