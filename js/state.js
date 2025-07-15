// ===== APPLICATION STATE MANAGEMENT =====

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
    audioFiles: Config.audioFiles,
    thankYouAudio: Config.specialAudio.thankYou,
    confirmationSound: Config.specialAudio.confirmation,
    systemErrorAudio: Config.specialAudio.systemError,
    humanWakeupAudio: Config.specialAudio.humanWakeup,
    
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
        if (this.motherInterruptTimer) {
            clearTimeout(this.motherInterruptTimer);
            this.motherInterruptTimer = null;
        }
        if (this.holdingTimer) {
            clearTimeout(this.holdingTimer);
            this.holdingTimer = null;
        }
    },
    
    // Move to next step
    nextStep: function() {
        this.step++;
        this.updateProgress();
    },
    
    // Update progress bar
    updateProgress: function() {
        var percentage = ((this.step + 1) / Config.settings.totalSteps) * 100;
        UI.updateProgress(percentage);
    },
    
    // Save user response
    saveResponse: function(key, value) {
        this.responses[key] = value;
        console.log('Saved response:', key, '=', value);
    },
    
    // Add to score
    addScore: function(points) {
        this.score += points;
        console.log('Score updated:', this.score, '(+' + points + ')');
    },
    
    // Get current step configuration
    getCurrentStepConfig: function() {
        return {
            ui: Config.conversationFlow.stepUI[this.step],
            audio: this.audioFiles[this.step],
            buttonText: Config.conversationFlow.buttonText[this.step],
            branches: Config.conversationFlow.branches[this.step]
        };
    },
    
    // Check if step is automatic progression
    isAutoStep: function(step) {
        var stepNum = step !== undefined ? step : this.step;
        return Config.conversationFlow.stepUI[stepNum] === 'auto';
    },
    
    // Check if course is complete
    isComplete: function() {
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
            platform: Config.platform
        };
    }
};

// === UI CONTROLLER ===
var UI = {
    // === ELEMENT UTILITIES ===
    element: function(id) { 
        return document.getElementById(id); 
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
        }
    },
    
    hideElement: function(id) { 
        var element = this.element(id);
        if (element) {
            element.classList.remove('active', 'visible');
            element.classList.add('hidden');
        }
    },
    
    // === DNA VISUALIZER CONTROL ===
    setVisualizerState: function(state) { 
        var visualizer = this.element('visualizer');
        if (visualizer) {
            // Remove all state classes
            visualizer.classList.remove('speaking', 'listening', 'active', 'text-mode');
            // Add new state
            visualizer.className = 'voice-visualizer active ' + state;
        }
    },
    
    // === PROGRESS BAR ===
    updateProgress: function(percentage) {
        var bar = this.element('progressBar');
        if (bar) {
            bar.style.width = percentage + '%';
        }
    },
    
    // === BUTTON VISIBILITY HELPERS ===
    hideAllInteractiveElements: function() {
        var containers = [
            'dnaTextButton',
            'answerChoicesContainer', 
            'whyGermanInputContainer',
            'goalInputContainer',
            'timeInputContainer', 
            'probabilityChoicesContainer',
            'scaleChoicesContainer',
            'aiChoicesContainer',
            'motherDescriptionContainer',
            'profileContainer'
        ];
        
        containers.forEach(function(id) {
            var element = UI.element(id);
            if (element) {
                element.classList.remove('visible');
                element.style.opacity = '0';
                element.style.pointerEvents = 'none';
            }
        });
        
        // Remove text mode from visualizer
        var visualizer = this.element('visualizer');
        if (visualizer) {
            visualizer.classList.remove('text-mode');
        }
    }
};

// === CONTROLS ===
var Controls = {
    skip: function() {
        console.log('Skip button clicked');
        
        // Stop all audio
        AudioManager.stopAllAudio();
        
        // Clear timers
        if (State.motherInterruptTimer) {
            clearTimeout(State.motherInterruptTimer);
            State.motherInterruptTimer = null;
        }
        
        // Reset speaking state
        State.isSpeaking = false;
        UI.setVisualizerState('active');
        
        // Hide current UI
        UI.hideAllInteractiveElements();
        
        // Handle current step logic
        if (DNAButton.currentMode === 'text') {
            setTimeout(function() {
                DNAButton.handleClick();
            }, 100);
        } else if (DNAButton.currentMode === 'choices') {
            DNAButton.handleAnswerChoice(0);
        } else if (DNAButton.currentMode === 'time-input') {
            DNAButton.handleTimeSubmit();
        } else if (DNAButton.currentMode === 'probability') {
            DNAButton.handleProbabilityChoice('medium');
        } else if (DNAButton.currentMode === 'scale') {
            DNAButton.handleScaleChoice(5);
        } else if (DNAButton.currentMode === 'ai') {
            DNAButton.handleAIChoice('diverse');
        } else if (DNAButton.currentMode === 'why-german-input') {
            DNAButton.handleWhyGermanSubmit();
        } else if (DNAButton.currentMode === 'goal-input') {
            DNAButton.handleGoalSubmit();
        } else if (DNAButton.currentMode === 'mother-description') {
            DNAButton.handleMotherDescriptionSubmit();
        } else if (DNAButton.currentMode === 'profile') {
            Conversation.dissolveAndTransition();
        } else {
            // Default action
            UI.setVisualizerState('active');
            setTimeout(function() {
                Conversation.moveToNextQuestion();
            }, 300);
        }
    },
    
    quit: function() {
        if (confirm('Are you sure you want to quit the assessment?')) {
            try {
                window.history.back();
            } catch (e) {
                window.close();
            }
        }
    },

    exitAssessment: function() {
        if (confirm('Are you sure you want to exit the assessment?')) {
            // Stop all audio first
            AudioManager.stopAllAudio();
            
            // Exit fullscreen if active
            try {
                if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    }
                }
            } catch (e) {
                console.log('Fullscreen exit error:', e);
            }
            
            // Remove the SG1 container entirely
            var sg1Container = document.querySelector('.sg1-container');
            if (sg1Container) {
                sg1Container.remove();
            }
            
            // Restore page scroll and visibility
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
            
            // Clear any global audio elements
            if (window.audioElements) {
                window.audioElements.forEach(function(audio) {
                    try {
                        audio.pause();
                        audio.src = '';
                    } catch (e) {}
                });
                window.audioElements = [];
            }
            
            // Make sure the underlying page is visible
            var allElements = document.querySelectorAll('*:not(.sg1-container):not(.sg1-container *)');
            allElements.forEach(function(el) {
                if (el.style.display === 'none') {
                    el.style.display = '';
                }
            });
        }
    }
};