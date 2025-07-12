# SG1 - AI German Learning System

## Project Overview
Interactive web-based German learning experience with AI persona. Features audio-driven conversations, visual DNA animations, and a sci-fi aesthetic.

## Core Architecture

### Audio System
- **Background music**: Continuous loop (`backgroundMusic` audio element)
- **Speech audio**: Pre-recorded MP3 files for 7 conversation steps
- **Critical iOS issue**: Multiple simultaneous audio streams blocked on iOS Chrome/Safari
- **Current solution**: `AudioManager.createAndPlayAudio()` creates audio immediately within button click handlers to stay within iOS autoplay token window

### Conversation Flow (7 Steps)
0. Welcome message → "Bereit" button
1. Social/anti-social question → Hold-to-speak button  
2. Hesitance question → "Ja" button
3. Mother relationship → Hold-to-speak (auto-interrupt after 7s)
4. Voice preference → Hold-to-speak  
5. Gender response → Auto-advance to final sequence
6. Michael introduction → "Na gut" button → Course completion

### Visual Components
- **Gradient background**: Animated shifting colors
- **SG1 logo**: Fades in/out over 13 seconds
- **DNA visualizer**: SVG animation, appears AFTER logo fades (13.5s), no overlap
- **Button states**: Speaking (fast DNA), listening (golden DNA), idle
- **Progress bar**: Updates with conversation progress

## Key Technical Files

### State Management
```javascript
State = {
    step: 0-6,           // Current conversation step
    audioFiles: {},      // URLs for each step's audio
    isSpeaking: boolean, // Controls DNA animation
    currentAudio: null   // Active audio element reference
}
```

### Critical Timing
- **Initialization**: Logo (0-13s) → DNA (13.5s+) → Voice (14s)
- **Mobile-specific**: Voice starts at 3s during initialization to preserve autoplay token
- **Button interactions**: Audio MUST be created immediately in click handlers (iOS requirement)

## Known Issues & Solutions

### iOS Audio Problem
**Issue**: iOS blocks multiple audio streams  
**Current fix**: Immediate audio creation in button handlers  
**Fallback**: Web Audio API (complex rewrite) if current fix fails

### Mobile Debug
**Issue**: Debug panel not showing on mobile  
**Fix**: z-index 99999, mobile detection auto-enables debug

### Timing Sequences
**Critical**: No visual overlap between logo and DNA (style requirement)  
**Implementation**: DNA appears at 13.5s, after logo completes fade at 13s

## File Structure
- Single HTML file with embedded CSS/JS
- External audio files hosted on teachable CDN
- No dependencies, vanilla JavaScript

## Debug System
- Always visible on mobile devices
- Tracks audio creation, playback, button interactions
- Essential for troubleshooting iOS audio issues

## Web Audio API Solution for iOS

### The Problem
iOS Safari/Chrome restricts multiple `<audio>` elements from playing simultaneously. When you try to play speech while background music is running, one gets paused or blocked.

### The Solution
Use Web Audio API's `AudioContext` to create a single audio "session" that can mix multiple sources internally.

#### How Web Audio API Works

Instead of multiple `<audio>` elements:
```javascript
// Current approach (blocked on iOS)
var backgroundMusic = new Audio('music.mp3');
var speechAudio = new Audio('speech.mp3');
backgroundMusic.play(); // Works
speechAudio.play();     // Gets blocked on iOS
```

Use AudioContext with multiple sources:
```javascript
// Web Audio API approach (works on iOS)
const audioContext = new AudioContext();
// All audio goes through ONE context = iOS sees it as one "stream"
```

#### Implementation Architecture

**1. Audio Loading System**
```javascript
// Load all audio as ArrayBuffers (not streaming)
async function loadAudioBuffer(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}

// Preload all audio during initialization
const audioBuffers = {
    backgroundMusic: await loadAudioBuffer('music.mp3'),
    step0: await loadAudioBuffer('step0.mp3'),
    step1: await loadAudioBuffer('step1.mp3'),
    // ... etc
};
```

**2. Audio Mixing & Playback**
```javascript
function playSimultaneousAudio() {
    // Create multiple sources from the same context
    const musicSource = audioContext.createBufferSource();
    const speechSource = audioContext.createBufferSource();
    
    // Assign audio data
    musicSource.buffer = audioBuffers.backgroundMusic;
    speechSource.buffer = audioBuffers.step1;
    
    // Create volume controls
    const musicGain = audioContext.createGain();
    const speechGain = audioContext.createGain();
    
    musicGain.gain.value = 0.3;  // Background volume
    speechGain.gain.value = 1.0; // Speech volume
    
    // Connect audio graph: source → gain → speakers
    musicSource.connect(musicGain).connect(audioContext.destination);
    speechSource.connect(speechGain).connect(audioContext.destination);
    
    // Start both simultaneously
    musicSource.start(0);                           // Now
    speechSource.start(audioContext.currentTime + 14); // 14 seconds later
}
```

**3. Complete SG1 Implementation Example**
```javascript
var WebAudioManager = {
    context: null,
    buffers: {},
    currentSources: {},
    
    async init() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        
        // Load all audio files
        const audioUrls = {
            backgroundMusic: 'https://uploads.teachablecdn.com/...',
            step0: 'https://uploads.teachablecdn.com/...',
            // ... all your audio URLs
        };
        
        for (const [key, url] of Object.entries(audioUrls)) {
            this.buffers[key] = await this.loadBuffer(url);
        }
    },
    
    async loadBuffer(url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await this.context.decodeAudioData(arrayBuffer);
    },
    
    playBackground() {
        const source = this.context.createBufferSource();
        source.buffer = this.buffers.backgroundMusic;
        source.loop = true;
        
        const gain = this.context.createGain();
        gain.gain.value = 0.3;
        
        source.connect(gain).connect(this.context.destination);
        source.start(0);
        
        this.currentSources.background = source;
    },
    
    playSpeech(step, delay = 0) {
        const source = this.context.createBufferSource();
        source.buffer = this.buffers[`step${step}`];
        
        const gain = this.context.createGain();
        gain.gain.value = 1.0;
        
        source.connect(gain).connect(this.context.destination);
        source.start(this.context.currentTime + delay);
        
        this.currentSources.speech = source;
        
        return new Promise(resolve => {
            source.onended = resolve;
        });
    }
};
```

#### Pros & Cons

**Advantages**
- ✅ **Guaranteed iOS compatibility**: Single AudioContext bypasses multiple audio restrictions
- ✅ **Precise timing**: Better than setTimeout for audio scheduling
- ✅ **Professional audio mixing**: Real volume control, effects possible
- ✅ **Better performance**: More efficient than multiple Audio elements

**Disadvantages**
- ❌ **Complex implementation**: Complete rewrite of audio system
- ❌ **Memory usage**: All audio loaded into RAM (no streaming)
- ❌ **Loading time**: Must download all audio before any can play
- ❌ **Browser support**: Requires AudioContext (IE11+ limitation)

#### Browser Support Details

**What AudioContext limitation means:**

The Web Audio API is a relatively modern browser feature that wasn't available in older browsers.

**Supported browsers:**
- ✅ Chrome 14+ (2011)
- ✅ Firefox 25+ (2013) 
- ✅ Safari 6+ (2012)
- ✅ Edge (all versions)
- ✅ iOS Safari 6+ (2012)
- ✅ Android Chrome 25+ (2013)

**NOT supported:**
- ❌ Internet Explorer 10 and below
- ❌ Very old Android browsers (pre-2013)
- ❌ Legacy mobile browsers

**Practical Impact for SG1:**
- Web Audio API has **96%+ global browser support** as of 2024
- Target audience (German learners) likely uses modern browsers
- Educational context means users tend to have updated browsers
- **This limitation is mostly theoretical for modern web applications**

**Fallback Strategy:**
```javascript
function hasWebAudioSupport() {
    return !!(window.AudioContext || window.webkitAudioContext);
}

// Use appropriate audio system
if (hasWebAudioSupport()) {
    // Use Web Audio API (guaranteed iOS compatibility)
    WebAudioManager.init();
} else {
    // Fall back to current <audio> element approach
    AudioManager.init();
}
```

#### Migration Strategy
1. **Phase 1**: Keep current system, add Web Audio as fallback
2. **Phase 2**: Test Web Audio implementation thoroughly  
3. **Phase 3**: Switch to Web Audio as primary, keep current as fallback
1. **Primary challenge**: iOS simultaneous audio playback
2. **Test priority**: Button-triggered audio on iOS Chrome/Safari  
3. **Timing critical**: All audio creation must happen within user interaction handlers
4. **Style requirement**: Slow fades, no visual overlaps
5. **Mobile-first debugging**: Debug panel shows detailed audio state tracking

## Audio File URLs
```javascript
audioFiles: {
    0: 'https://uploads.teachablecdn.com/attachments/fa6567b6d8e64c3dbb04265db8f4b44f.mp3',
    1: 'https://uploads.teachablecdn.com/attachments/92551ade5a0a468d9669a7bc79ae4b13.mp3',
    2: 'https://uploads.teachablecdn.com/attachments/56f253bb9c8c46749eb7cdbb4cfa1c10.mp3',
    3: 'https://uploads.teachablecdn.com/attachments/e85d721b671746169040af93a4aa37b1.mp3',
    4: 'https://uploads.teachablecdn.com/attachments/ac76bcc7a7dd4544b0364e277ceb0970.mp3',
    5: 'https://uploads.teachablecdn.com/attachments/0cdfc0ce7a3245618d7fed8ce25d7d3b.mp3',
    6: 'https://uploads.teachablecdn.com/attachments/28a3453828b247529b17c6cfc0cc745c.mp3'
},
thankYouAudio: 'https://uploads.teachablecdn.com/attachments/4e2906fba5dc40e6bd0d294332e94123.mp3',
finalThankYouAudio: 'https://uploads.teachablecdn.com/attachments/8f1a13b6a0e14abb885ef5f979d3d6c7.mp3',
backgroundMusic: 'https://uploads.teachablecdn.com/attachments/2e3c2b54489041f0bc81ac3898704e43.m4a'
```

## Key Functions

### AudioManager.createAndPlayAudio()
Critical function for iOS compatibility. Creates and plays audio immediately within user interaction to preserve autoplay token.

### Conversation Flow Handlers
- `handleBereit()`: Step 0 → 1 transition
- `handleJa()`: Step 2 → 3 transition  
- `startHolding()/stopHolding()`: Hold-to-speak interactions
- `handleNaGut()`: Final completion

### UI State Management
- `UI.setVisualizerState()`: Controls DNA animation (speaking/listening/idle)
- `UI.showElement()/hideElement()`: Manages overlay transitions
- `UI.updateProgress()`: Progress bar updates

## Testing Checklist
- [ ] Desktop: Logo → DNA sequence (no overlap)
- [ ] Desktop: Background music + speech audio simultaneous
- [ ] Mobile: Debug panel visible and functional
- [ ] Mobile: First audio plays after "Initiate AI" 
- [ ] Mobile: Button-triggered audio (steps 1-6)
- [ ] iOS Chrome: Multiple audio streams
- [ ] iOS Safari: Multiple audio streams
- [ ] Button interactions: Immediate audio response
- [ ] Hold-to-speak: Visual feedback + audio progression

## Performance Notes
- Single HTML file keeps everything contained
- CSS animations optimized for 60fps
- Audio preloading for smooth transitions
- Mobile-specific timing adjustments for autoplay restrictions

## Future Considerations
If iOS audio issues persist:
1. Implement Web Audio API solution
2. Consider sequential audio (pause background during speech)
3. Add audio loading indicators
4. Implement fallback text-to-speech

---

**Last Updated**: Current implementation focuses on iOS audio compatibility through immediate audio creation in user interaction handlers.