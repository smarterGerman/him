// ===== APPLICATION STATE MANAGEMENT - UPDATED =====

var State = {
    // === CONVERSATION FLOW ===
    step: 0,                           // Current step (0-11)
    isSpeaking: false,                 // Controls DNA animation state
    inFinalSequence: false,            // Final conversation sequence flag
    
    // === AUDIO CONTROL ===
    audioUnlocked: false,              // iOS autoplay permission status
    mobileAudioStarted: false,         // Mobile-specific audio initialization
    
    // === TIMERS ===
    motherInterruptTimer: null,        // Auto-interrupt for mother question
    holdingTimer: null,                // Hold-to-speak button timer
    
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
        // UPDATED: Now references the special diverse AI audio
        return typeof Config !== 'undefined' ? Config.specialAudio.diverseAI : '';
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
    },
    
    // Move to next step (CONSISTENT METHOD)
    nextStep: function() {
        this.step++;
        this.updateProgress();
        return this.step;
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
    
    // Export state for debugging
    exportState: function() {
        return {
            step: this.step,
            isSpeaking: this.isSpeaking,
            inFinalSequence: this.inFinalSequence,
            audioUnlocked: this.audioUnlocked,
            selectedAIType: this.selectedAIType,
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
                
                // Clear any event listeners for text inputs
                var input = element.querySelector('input, textarea');
                if (input) {
                    input.value = '';
                    // Clone the input to remove all event listeners
                    try {
                        var newInput = input.cloneNode(true);
                        input.parentNode.replaceChild(newInput, input);
                    } catch (e) {
                        console.warn('Could not clean input for:', id);
                    }
                }
                hiddenCount++;
            }
        });
        
        // Remove text mode from visualizer
        var visualizer = this.element('visualizer');
        if (visualizer) {
            visualizer.classList.remove('text-mode');
        }
        
        console.log('✅ Hidden', hiddenCount, 'interactive elements');
        return hiddenCount;
    }
};

// === ENHANCED CONTROLS OBJECT ===
var Controls = {
    // === COMPREHENSIVE AUDIO STOPPING ===
    stopAllAudio: function() {
        console.log('🛑 STOPPING ALL AUDIO - Comprehensive approach');
        
        var stoppedCount = 0;
        
        try {
            // Method 1: Stop all HTML5 audio elements
            var allAudio = document.querySelectorAll('audio');
            console.log('Found ' + allAudio.length + ' audio elements');
            
            for (var i = 0; i < allAudio.length; i++) {
                try {
                    allAudio[i].pause();
                    allAudio[i].currentTime = 0;
                    allAudio[i].volume = 0;
                    allAudio[i].muted = true;
                    stoppedCount++;
                } catch (e) {
                    console.warn('Error stopping audio element ' + i + ':', e);
                }
            }
        } catch (e) {
            console.error('Error stopping HTML5 audio:', e);
        }

        try {
            // Method 2: Stop Web Audio API sources
            if (typeof WebAudioHelper !== 'undefined' && WebAudioHelper.currentSource) {
                WebAudioHelper.currentSource.stop();
                WebAudioHelper.currentSource = null;
                console.log('Stopped WebAudio source');
            }
        } catch (e) {
            console.warn('Error stopping WebAudio:', e);
        }

        try {
            // Method 3: Stop tracked audio elements
            if (window.audioElements && Array.isArray(window.audioElements)) {
                window.audioElements.forEach(function(audio, index) {
                    try {
                        audio.pause();
                        audio.currentTime = 0;
                        audio.volume = 0;
                        audio.muted = true;
                    } catch (e) {
                        console.warn('Error stopping tracked audio ' + index + ':', e);
                    }
                });
                window.audioElements = [];
            }
        } catch (e) {
            console.warn('Error stopping tracked audio:', e);
        }

        try {
            // Method 4: Suspend Audio Context
            if (window.globalAudioContext) {
                window.globalAudioContext.suspend().then(function() {
                    console.log('Audio context suspended');
                }).catch(function(e) {
                    console.warn('Error suspending audio context:', e);
                });
            }
        } catch (e) {
            console.warn('Error with audio context:', e);
        }

        try {
            // Method 5: Stop AudioManager if available
            if (typeof AudioManager !== 'undefined' && AudioManager.stopAllAudio) {
                AudioManager.stopAllAudio();
                console.log('Called AudioManager.stopAllAudio()');
            }
        } catch (e) {
            console.warn('Error calling AudioManager:', e);
        }

        // Method 6: Clear timers and update state
        try {
            if (typeof State !== 'undefined') {
                State.isSpeaking = false;
                State.clearTimers();
            }
        } catch (e) {
            console.warn('Error clearing state/timers:', e);
        }

        console.log('✅ Audio stopping completed. Stopped:', stoppedCount, 'elements');
        return stoppedCount;
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

    // === SMART SKIP FUNCTION ===
    skip: function() {
        console.log('Skip button clicked for step:', State.step);
        
        // Stop all audio
        this.stopAllAudio();
        
        // Reset state
        State.isSpeaking = false;
        UI.setVisualizerState('active');
        UI.hideAllInteractiveElements();
        
        // Handle current step with appropriate defaults
        this.handleSkipForCurrentStep();
    },
    
    // === HANDLE SKIP FOR CURRENT STEP ===
    handleSkipForCurrentStep: function() {
        if (typeof DNAButton === 'undefined') {
            console.warn('DNAButton not available for skip');
            return;
        }
        
        var mode = DNAButton.currentMode;
        
        switch (mode) {
            case 'text':
                setTimeout(function() { DNAButton.handleClick(); }, 100);
                break;
            case 'probability':
                DNAButton.handleProbabilityChoice('medium');
                break;
            case 'scale':
                DNAButton.handleScaleChoice(5);
                break;
            case 'ai':
                DNAButton.handleAIChoice('diverse');
                break;
            case 'why-german-input':
                this.skipTextInput('whyGermanInput', 'Skipped', DNAButton.handleWhyGermanSubmit);
                break;
            case 'goal-input':
                this.skipTextInput('goalInput', 'Skipped', DNAButton.handleGoalSubmit);
                break;
            case 'time-input':
                this.skipTextInput('timeInput', '5 hours', DNAButton.handleTimeSubmit);
                break;
            case 'mother-description':
                this.skipTextInput('motherDescriptionInput', 'Skipped', DNAButton.handleMotherDescriptionSubmit);
                break;
            case 'profile':
                if (typeof Conversation !== 'undefined') {
                    Conversation.dissolveAndTransition();
                }
                break;
            default:
                // Default action - advance to next step
                setTimeout(function() {
                    if (typeof Conversation !== 'undefined') {
                        Conversation.moveToNextQuestion();
                    }
                }, 300);
        }
    },
    
    // === HELPER FOR SKIPPING TEXT INPUTS ===
    skipTextInput: function(inputId, defaultValue, submitHandler) {
        var input = UI.element(inputId);
        if (input) {
            input.value = defaultValue;
        }
        if (typeof submitHandler === 'function') {
            submitHandler.call(DNAButton);
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