// ===== APPLICATION STATE MANAGEMENT - FIXED DIVERSE AI AUDIO =====

var State = {
    // === CONVERSATION FLOW ===
    step: 0,                           // Current step (0-11)
    isSpeaking: false,                 // Controls DNA animation state
    inFinalSequence: false,            // Final conversation sequence flag
    
    // === AUDIO CONTROL ===
    audioUnlocked: false,              // iOS autoplay permission status
    mobileAudioStarted: false,         // Mobile-specific audio initialization
    hasSkippedToStep0: false,          // ADDED: Tracks if we've skipped to step 0
    skipModeActive: false,             // ADDED: Tracks if we're in skip mode
    
    // === TIMERS ===
    motherInterruptTimer: null,        // Auto-interrupt for mother question
    holdingTimer: null,                // Hold-to-speak button timer
    allTimers: [],                     // Track ALL conversation timers
    
    // === INITIALIZATION TIMERS ===
    initTimers: [],                    // Track all initialization timers
    isInitializing: false,             // Track if we're still in init sequence
    
    // === USER SELECTIONS ===
    selectedAIType: null,              // 'male', 'female', or 'diverse'
    
    // === USER RESPONSES ===
    responses: {},                     // Store all user responses
    score: 0,                         // Internal scoring system
    
    // === AUDIO FILES (from Config) ===
    get audioFiles() {
        return typeof Config !== 'undefined' ? Config.audioFiles : {};
    },
    get thankYouAudio() {
        return typeof Config !== 'undefined' ? Config.specialAudio.thankYou : '';
    },
    get confirmationSound() {
        return typeof Config !== 'undefined' ? Config.specialAudio.confirmation : '';
    },
    get systemErrorAudio() {
        return typeof Config !== 'undefined' ? Config.specialAudio.systemError : '';
    },
    get humanWakeupAudio() {
        return typeof Config !== 'undefined' ? Config.specialAudio.humanWakeup : '';
    },
    get aiTypeMaleAudio() {
        return typeof Config !== 'undefined' ? Config.audioFiles[8] : '';
    },
    get aiTypeFemaleAudio() {
        return typeof Config !== 'undefined' ? Config.audioFiles[9] : '';
    },
    get aiTypeDiverseAudio() {
        // FIXED: Now uses audioFiles[10] for diverse AI
        return typeof Config !== 'undefined' ? Config.audioFiles[10] : '';
    },
    get analysingInputAudio() {
        return typeof Config !== 'undefined' ? Config.specialAudio.analysingInput : '';
    },
    
    // === STATE MANAGEMENT METHODS ===
    
    // Reset state to initial values
    reset: function() {
        this.step = 0;
        this.isSpeaking = false;
        this.inFinalSequence = false;
        this.audioUnlocked = false;
        this.mobileAudioStarted = false;
        this.hasSkippedToStep0 = false;
        this.skipModeActive = false;
        this.selectedAIType = null;
        this.responses = {};
        this.score = 0;
        
        // Clear timers
        this.clearTimers();
    },
    
    // Clear all timers
    clearTimers: function() {
        if (this.motherInterruptTimer) {
            clearTimeout(this.motherInterruptTimer);
            this.motherInterruptTimer = null;
        }
        if (this.holdingTimer) {
            clearTimeout(this.holdingTimer);
            this.holdingTimer = null;
        }
        // Clear all conversation timers
        console.log('🧹 Clearing', this.allTimers.length, 'conversation timers');
        this.allTimers.forEach(function(timerId) {
            clearTimeout(timerId);
        });
        this.allTimers = [];
        // Clear initialization timers too
        this.clearInitTimers();
    },
    
    // Add a timer to tracking (with automatic cleanup)
    addTimer: function(timerId) {
        this.allTimers.push(timerId);
        console.log('⏱️ Timer added. Total active:', this.allTimers.length);
        return timerId;
    },
    
    // Add a timer with auto-cleanup after execution
    addTimerWithCleanup: function(callback, delay) {
        var self = this;
        var timerId = setTimeout(function() {
            callback();
            self.removeTimer(timerId);
        }, delay);
        this.allTimers.push(timerId);
        console.log('⏱️ Auto-cleanup timer added. Total active:', this.allTimers.length);
        return timerId;
    },
    
    // Remove a specific timer from tracking
    removeTimer: function(timerId) {
        var index = this.allTimers.indexOf(timerId);
        if (index > -1) {
            this.allTimers.splice(index, 1);
            console.log('🧹 Timer removed. Remaining:', this.allTimers.length);
        }
    },
    
    // Add initialization timer
    addInitTimer: function(timerId) {
        this.initTimers.push(timerId);
    },
    
    // Clear all initialization timers
    clearInitTimers: function() {
        console.log('🧹 Clearing', this.initTimers.length, 'initialization timers');
        this.initTimers.forEach(function(timerId) {
            clearTimeout(timerId);
        });
        this.initTimers = [];
        this.isInitializing = false;
    },
    
    // Move to next step (CONSISTENT METHOD)
    nextStep: function() {
        this.step++;
        this.updateProgress();
        return this.step;
    },
    
    // ADDED: Set step directly (for skipping)
    setStep: function(newStep) {
        this.step = newStep;
        this.updateProgress();
        
        // Mark that we've skipped if jumping to step 0
        if (newStep === 0) {
            this.hasSkippedToStep0 = true;
        }
        
        return this.step;
    },
    
    // ADDED: Enable skip mode
    enableSkipMode: function() {
        this.skipModeActive = true;
        console.log('🔄 Skip mode enabled - audio will be bypassed');
    },
    
    // ADDED: Disable skip mode
    disableSkipMode: function() {
        this.skipModeActive = false;
        console.log('🔄 Skip mode disabled - normal audio flow resumed');
    },
    
    // ADDED: Check if should skip audio
    shouldSkipAudio: function(step) {
        var targetStep = step !== undefined ? step : this.step;
        
        // Skip welcome audio if we've explicitly skipped to step 0
        if (targetStep === 0 && this.hasSkippedToStep0) {
            return true;
        }
        
        // Skip audio if in active skip mode
        if (this.skipModeActive) {
            return true;
        }
        
        return false;
    },
    
    // Update progress bar (CONSISTENT METHOD)
    updateProgress: function() {
        if (typeof Config !== 'undefined') {
            var percentage = ((this.step + 1) / Config.settings.totalSteps) * 100;
            UI.updateProgress(percentage);
            return percentage;
        }
        return 0;
    },
    
    // Save user response (CONSISTENT METHOD)
    saveResponse: function(key, value) {
        this.responses[key] = value;
        console.log('✅ Response saved:', key, '=', value);
        
        // Auto-save to localStorage for data persistence
        this.saveToStorage();
        
        return this.responses[key];
    },
    
    // Add to score (CONSISTENT METHOD) 
    addScore: function(points) {
        this.score += points;
        console.log('✅ Score updated:', this.score, '(+' + points + ')');
        return this.score;
    },
    
    // Get current step configuration
    getCurrentStepConfig: function() {
        if (typeof Config === 'undefined') return null;
        
        return {
            ui: Config.conversationFlow.stepUI[this.step],
            audio: this.audioFiles[this.step],
            buttonText: Config.conversationFlow.buttonText[this.step],
            branches: Config.conversationFlow.branches[this.step]
        };
    },
    
    // Check if step is automatic progression
    isAutoStep: function(step) {
        if (typeof Config === 'undefined') return false;
        
        var stepNum = step !== undefined ? step : this.step;
        return Config.conversationFlow.stepUI[stepNum] === 'auto';
    },
    
    // Check if course is complete
    isComplete: function() {
        if (typeof Config === 'undefined') return false;
        return this.step >= Config.settings.totalSteps;
    },
    
    // Save state to storage (for page reload recovery)
    saveToStorage: function() {
        try {
            var stateData = {
                step: this.step,
                responses: this.responses,
                score: this.score,
                selectedAIType: this.selectedAIType,
                timestamp: Date.now()
            };
            sessionStorage.setItem('sg1_state', JSON.stringify(stateData));
            console.log('💾 State saved to sessionStorage');
        } catch(e) {
            console.warn('Could not save state to storage:', e);
        }
    },
    
    // Restore state from storage (after page reload)
    restoreFromStorage: function() {
        try {
            var saved = sessionStorage.getItem('sg1_state');
            if (saved) {
                var data = JSON.parse(saved);
                
                // Only restore if less than 30 minutes old
                if (Date.now() - data.timestamp < 1800000) {
                    this.step = data.step;
                    this.responses = data.responses;
                    this.score = data.score;
                    this.selectedAIType = data.selectedAIType;
                    console.log('✅ State restored from sessionStorage. Step:', this.step);
                    return true;
                }
            }
        } catch(e) {
            console.warn('Could not restore state from storage:', e);
        }
        return false;
    },
    
    // Clear saved state from storage
    clearStorage: function() {
        try {
            sessionStorage.removeItem('sg1_state');
            console.log('🧹 Cleared saved state from sessionStorage');
        } catch(e) {
            console.warn('Could not clear storage:', e);
        }
    },
    
    // Export state for debugging
    exportState: function() {
        return {
            step: this.step,
            isSpeaking: this.isSpeaking,
            inFinalSequence: this.inFinalSequence,
            audioUnlocked: this.audioUnlocked,
            selectedAIType: this.selectedAIType,
            skipModeActive: this.skipModeActive,
            hasSkippedToStep0: this.hasSkippedToStep0,
            responses: Object.keys(this.responses),
            score: this.score,
            platform: typeof Config !== 'undefined' ? Config.platform : 'unknown'
        };
    }
};

// === UI CONTROLLER ===
var UI = {
    // === ELEMENT UTILITIES (CONSISTENT METHOD) ===
    element: function(id) { 
        try {
            return document.getElementById(id);
        } catch (e) {
            console.error('UI.element error for id:', id, e);
            return null;
        }
    },
    
    // === VISIBILITY MANAGEMENT ===
    showElement: function(id) { 
        var element = this.element(id);
        if (element) {
            element.classList.remove('hidden');
            element.classList.add('active', 'visible');
            element.style.display = 'flex';
            if (id === 'visualizer') {
                element.style.opacity = '1';
            }
            return true;
        }
        return false;
    },
    
    hideElement: function(id) { 
        var element = this.element(id);
        if (element) {
            element.classList.remove('active', 'visible');
            element.classList.add('hidden');
            return true;
        }
        return false;
    },
    
    // === DNA VISUALIZER CONTROL ===
    setVisualizerState: function(state) { 
        var visualizer = this.element('visualizer');
        if (visualizer) {
            // Remove only animation state classes, keep text-mode
            visualizer.classList.remove('speaking', 'listening', 'active');
            // Add new state
            visualizer.classList.add('active', state);
            return true;
        }
        return false;
    },
    
    // === PROGRESS BAR ===
    updateProgress: function(percentage) {
        var bar = this.element('progressBar');
        if (bar) {
            bar.style.width = Math.max(0, Math.min(100, percentage)) + '%';
            return true;
        }
        return false;
    },
    
    // === BUTTON VISIBILITY HELPERS ===
    hideAllInteractiveElements: function() {
    console.log('🧹 Hiding all interactive elements');
    
    var containers = [
        'dnaTextButton',
        'whyGermanInputContainer',
        'goalInputContainer',
        'timeInputContainer', 
        'probabilityChoicesContainer',
        'scaleChoicesContainer',
        'aiChoicesContainer',
        'motherDescriptionContainer',
        'profileContainer',
        'statusDisplay'
    ];
    
    var hiddenCount = 0;
    
    containers.forEach(function(id) {
        var element = UI.element(id);
        if (element) {
            element.classList.remove('visible');
            element.style.opacity = '0';
            element.style.pointerEvents = 'none';
            element.style.transform = 'translate(-50%, -50%)';
            
            // Clear input values and remove focus
            var input = element.querySelector('input, textarea');
            if (input) {
                input.value = '';
                input.blur();
                // Let garbage collection handle old listeners
            }
            hiddenCount++;
        }
    });
    
    // IMPORTANT: Remove text mode from visualizer to show DNA again
    var visualizer = this.element('visualizer');
    if (visualizer) {
        visualizer.classList.remove('text-mode');
        // Ensure DNA strands are visible
        var strands = visualizer.querySelectorAll('.dna-strand');
        strands.forEach(function(strand) {
            strand.style.opacity = '1';
        });
    }
    
    console.log('✅ Hidden', hiddenCount, 'interactive elements');
    return hiddenCount;
},

    // === SHOW INTERACTIVE ELEMENT WITH DNA FADE ===
    showInteractiveElement: function(id) {
        console.log('👁️ Showing interactive element:', id);
        
        var element = this.element(id);
        if (!element) {
            console.warn('Element not found:', id);
            return false;
        }
        
        // Add text-mode to visualizer to fade DNA
        var visualizer = this.element('visualizer');
        if (visualizer) {
            visualizer.classList.add('text-mode');
            console.log('✅ DNA faded for text input');
        }
        
        // Show the element
        element.classList.add('visible');
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
        element.style.transform = 'translate(-50%, -50%)';
        
        console.log('✅ Interactive element shown:', id);
        return true;
    }
};

// === ENHANCED CONTROLS OBJECT - FIXED SKIP FUNCTIONALITY ===
var Controls = {
    // === COMPREHENSIVE AUDIO STOPPING ===
    stopAllAudio: function(stopBackground) {
        console.log('🛑 STOPPING ALL AUDIO - Using centralized AudioManager');
        
        try {
            // Method 1: Use centralized AudioManager
            if (typeof AudioManager !== 'undefined') {
                if (stopBackground === false) {
                    AudioManager.stopNonBackground();
                    console.log('✅ Called AudioManager.stopNonBackground()');
                } else {
                    AudioManager.stopAllAudio();
                    console.log('✅ Called AudioManager.stopAllAudio()');
                }
            }
        } catch (e) {
            console.warn('Error calling AudioManager:', e);
        }

        try {
            // Method 2: Stop Web Audio API sources
            if (typeof WebAudioHelper !== 'undefined' && WebAudioHelper.currentSource) {
                WebAudioHelper.currentSource.stop();
                WebAudioHelper.currentSource = null;
                console.log('✅ Stopped WebAudio source');
            }
        } catch (e) {
            console.warn('Error stopping WebAudio:', e);
        }

        try {
            // Method 3: Suspend Audio Context (only if stopping everything)
            if (stopBackground !== false && window.globalAudioContext) {
                window.globalAudioContext.suspend().then(function() {
                    console.log('✅ Audio context suspended');
                }).catch(function(e) {
                    console.warn('Error suspending audio context:', e);
                });
            }
        } catch (e) {
            console.warn('Error with audio context:', e);
        }

        // Method 4: Clear timers and update state
        try {
            if (typeof State !== 'undefined') {
                State.isSpeaking = false;
                State.clearTimers();
            }
        } catch (e) {
            console.warn('Error clearing state/timers:', e);
        }

        console.log('✅ Audio stopping completed');
    },

    // === CLEAN EXIT HANDLING ===
    exitAssessment: function() {
        console.log('🚪 Exit assessment - Clean approach');
        
        // Stop all audio immediately
        this.stopAllAudio();
        
        // Block any new audio
        if (typeof State !== 'undefined') {
            State.isSpeaking = false;
            State.audioUnlocked = false;
            State.inFinalSequence = true;
        }
        
        // Force exit fullscreen without waiting
        try {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        } catch (e) {
            console.warn('Fullscreen exit error:', e);
        }
        
        // Show confirmation dialog
        setTimeout(function() {
            var shouldExit = confirm('Exit the AI assessment?');
            
            if (shouldExit) {
                Controls.performExit();
            } else {
                Controls.handleExitCancelled();
            }
        }, 100);
    },
    
    // === PERFORM ACTUAL EXIT ===
    performExit: function() {
        try {
            window.history.back();
        } catch (e) {
            try {
                window.close();
            } catch (e2) {
                window.location.href = 'about:blank';
            }
        }
    },
    
    // === HANDLE CANCELLED EXIT ===
    handleExitCancelled: function() {
        console.log('Exit cancelled by user');
        
        // If background music should be playing, restart it
        try {
            if (typeof SG1 !== 'undefined' && SG1.musicEnabled) {
                var music = UI.element('backgroundMusic');
                if (music) {
                    music.volume = 0.3;
                    music.muted = false;
                    music.play().catch(function(e) {
                        console.log('Could not restart background music:', e);
                    });
                }
            }
        } catch (e) {
            console.warn('Error restarting audio:', e);
        }
    },

    // === IMPROVED SKIP FUNCTION ===
skip: function() {
    console.log('⏭️ Skip button clicked for step:', State.step);
    console.log('   Is initializing:', State.isInitializing);
    console.log('   Current mode:', DNAButton ? DNAButton.currentMode : 'N/A');

    // Capture initialization state before timers mutate it
    var wasInitializing = State.isInitializing;

    // Enable skip mode early so any playing/queued audio will bail out
    State.enableSkipMode();

    // Stop all non-background audio immediately, keep background music playing
    var stopped = this.stopAllAudio(false);
    console.log('⏭️ Skip requested - stopped non-background audio:', stopped);

    // Clear all pending timers immediately (also clears init timers)
    State.clearTimers();

    if (wasInitializing) {
        console.log('🚀 Skipping initialization sequence');

        UI.hideElement('initOverlay');

        var logo = document.querySelector('.init-logo');
        if (logo) {
            logo.style.animation = 'none';
            logo.style.opacity = '0';
            logo.style.display = 'none';
        }

        var statusText = UI.element('statusText');
        if (statusText) {
            statusText.style.display = 'none';
        }

        UI.showElement('visualizer');
        var visualizer = UI.element('visualizer');
        if (visualizer) {
            visualizer.style.opacity = '1';
            visualizer.style.transition = 'none';
        }

        State.isInitializing = false;
        State.hasSkippedToStep0 = true;
        State.step = 0;
        State.isSpeaking = false;
        UI.setVisualizerState('active');

        console.log('🎯 Showing Bereit button immediately after init skip');
        State.addTimer(setTimeout(function() {
            DNAButton.showText('Bereit', 'Ready');
        }, 500));

        State.addTimer(setTimeout(function() {
            State.disableSkipMode();
        }, 500));
        return;
    }

    State.isSpeaking = false;
    UI.setVisualizerState('active');
    UI.hideAllInteractiveElements();

    this.handleSkipForCurrentStep();

    State.addTimer(setTimeout(function() {
        State.disableSkipMode();
    }, 500));
},
    
    // === HANDLE SKIP FOR CURRENT STEP ===
    handleSkipForCurrentStep: function() {
        if (typeof DNAButton === 'undefined') {
            console.warn('DNAButton not available for skip');
            return;
        }
        
        var mode = DNAButton.currentMode;
        
        console.log('🔄 Handling skip for mode:', mode, 'at step:', State.step);
        
        switch (mode) {
            case 'text':
                // Skip current text and move to next immediately
                State.addTimer(setTimeout(function() { 
                    DNAButton.handleClick(); 
                }, 100));
                break;
            case 'probability':
                // Auto-select medium and move on
                DNAButton.handleProbabilityChoice('medium');
                break;
            case 'scale':
                // Auto-select 5 and move on
                DNAButton.handleScaleChoice(5);
                break;
            case 'ai':
                // Auto-select diverse and move on
                DNAButton.handleAIChoice('diverse');
                break;
            case 'why-german-input':
                this.skipTextInput('whyGermanInput', 'Skipped response', DNAButton.handleWhyGermanSubmit);
                break;
            case 'goal-input':
                this.skipTextInput('goalInput', 'Skipped response', DNAButton.handleGoalSubmit);
                break;
            case 'time-input':
                this.skipTextInput('timeInput', '5 hours per week', DNAButton.handleTimeSubmit);
                break;
            case 'mother-description':
                this.skipTextInput('motherDescriptionInput', 'Skipped response', DNAButton.handleMotherDescriptionSubmit);
                break;
            case 'profile':
                if (typeof Conversation !== 'undefined') {
                    Conversation.dissolveAndTransition();
                }
                break;
            case 'dna':
            default:
                // DNA mode or default - just show the button for current step
                console.log('🔄 DNA mode skip - showing button for current step:', State.step);
                if (typeof Conversation !== 'undefined') {
                    // Don't advance step - just show the button immediately
                    State.addTimer(setTimeout(function() {
                        Conversation.showNextButton();
                    }, 100));
                }
                break;
        }
        
    },
    
    // === HELPER FOR SKIPPING TEXT INPUTS ===
    skipTextInput: function(inputId, defaultValue, submitHandler) {
        var input = UI.element(inputId);
        if (input) {
            input.value = defaultValue;
        }
        if (typeof submitHandler === 'function') {
            if (State.skipModeActive) {
                submitHandler.call(DNAButton);
            } else {
                State.addTimer(setTimeout(function() {
                    submitHandler.call(DNAButton);
                }, 100));
            }
        }
    },

    // === QUIT FUNCTION ===
    quit: function() {
        if (confirm('Are you sure you want to quit the assessment?')) {
            this.stopAllAudio();
            this.performExit();
        }
    }
};