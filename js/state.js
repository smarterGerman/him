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
        
        containers.forEach(function(id) {
            var element = UI.element(id);
            if (element) {
                element.classList.remove('visible');
                element.style.opacity = '0';
                element.style.pointerEvents = 'none';
                element.style.transform = 'translate(-50%, -50%)';
                
                // Clear any event listeners for text inputs
                if (element.querySelector('input')) {
                    var input = element.querySelector('input');
                    input.value = '';
                    // Clone the input to remove all event listeners
                    var newInput = input.cloneNode(true);
                    input.parentNode.replaceChild(newInput, input);
                }
            }
        });
        
        // Remove text mode from visualizer
        var visualizer = this.element('visualizer');
        if (visualizer) {
            visualizer.classList.remove('text-mode');
        }
        
        console.log('✅ All interactive elements hidden');
    }
};

var Controls = {
    // Comprehensive audio stopping function
    stopAllAudio: function() {
        console.log('🛑 STOPPING ALL AUDIO - Exit button clicked');
        
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
                    // Don't clear src immediately as it might cause errors
                    console.log('Stopped audio element ' + i);
                } catch (e) {
                    console.log('Error stopping audio element ' + i + ':', e);
                }
            }
        } catch (e) {
            console.log('Error stopping HTML5 audio:', e);
        }

        try {
            // Method 2: Stop Web Audio API sources
            if (typeof WebAudioHelper !== 'undefined' && WebAudioHelper.currentSource) {
                WebAudioHelper.currentSource.stop();
                WebAudioHelper.currentSource = null;
                console.log('Stopped WebAudio source');
            }
        } catch (e) {
            console.log('Error stopping WebAudio:', e);
        }

        try {
            // Method 3: Stop tracked audio elements
            if (window.audioElements && Array.isArray(window.audioElements)) {
                console.log('Stopping ' + window.audioElements.length + ' tracked audio elements');
                window.audioElements.forEach(function(audio, index) {
                    try {
                        audio.pause();
                        audio.currentTime = 0;
                        audio.volume = 0;
                        audio.muted = true;
                        console.log('Stopped tracked audio ' + index);
                    } catch (e) {
                        console.log('Error stopping tracked audio ' + index + ':', e);
                    }
                });
                window.audioElements = [];
            }
        } catch (e) {
            console.log('Error stopping tracked audio:', e);
        }

        try {
            // Method 4: Suspend Audio Context
            if (window.globalAudioContext) {
                window.globalAudioContext.suspend().then(function() {
                    console.log('Audio context suspended');
                }).catch(function(e) {
                    console.log('Error suspending audio context:', e);
                });
            }
        } catch (e) {
            console.log('Error with audio context:', e);
        }

        try {
            // Method 5: Stop AudioManager if available
            if (typeof AudioManager !== 'undefined' && AudioManager.stopAllAudio) {
                AudioManager.stopAllAudio();
                console.log('Called AudioManager.stopAllAudio()');
            }
        } catch (e) {
            console.log('Error calling AudioManager:', e);
        }

        // Method 6: Clear any timers that might restart audio
        try {
            if (typeof State !== 'undefined') {
                State.isSpeaking = false;
                if (State.motherInterruptTimer) {
                    clearTimeout(State.motherInterruptTimer);
                    State.motherInterruptTimer = null;
                }
                if (State.holdingTimer) {
                    clearTimeout(State.holdingTimer);
                    State.holdingTimer = null;
                }
            }
        } catch (e) {
            console.log('Error clearing timers:', e);
        }

        console.log('✅ Audio stopping sequence completed');
    },

    // New exit function with guaranteed audio stopping
    exitAssessment: function() {
    console.log('🚪 Exit button clicked');
    
    // IMMEDIATE audio stop - no delays
    this.stopAllAudio();
    
    // Also force stop any audio that might restart
    setTimeout(function() {
        Controls.stopAllAudio();
    }, 100);
    
    // Prevent any new audio from starting
    if (typeof State !== 'undefined') {
        State.isSpeaking = false;
        State.audioUnlocked = false;
    }
    
    // Exit fullscreen AFTER audio is stopped
    setTimeout(function() {
        try {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (document.webkitFullscreenElement) {
                document.webkitExitFullscreen();
            } else if (document.mozFullScreenElement) {
                document.mozCancelFullScreen();
            }
        } catch (e) {
            console.log('Fullscreen exit error:', e);
        }
        
        // Show confirmation after fullscreen exit
        setTimeout(function() {
            var shouldExit = confirm('Exit the AI assessment?');
            
            if (shouldExit) {
                // Final audio stop before navigation
                Controls.stopAllAudio();
                
                // Navigate away
                try {
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        Controls.tryCloseOrRedirect();
                    }
                } catch (e) {
                    console.log('Navigation error:', e);
                    Controls.tryCloseOrRedirect();
                }
            } else {
                // User cancelled - but keep audio stopped
                console.log('Exit cancelled - audio remains stopped');
            }
        }, 200);
        
    }, 200);
},
    
    // Handle when user cancels exit
    handleExitCancelled: function() {
        console.log('Exit cancelled by user');
        
        // If background music should be playing, restart it
        try {
            if (typeof SG1 !== 'undefined' && SG1.musicEnabled) {
                var music = document.getElementById('backgroundMusic');
                if (music) {
                    music.volume = 0.3;
                    music.muted = false;
                    music.play().catch(function(e) {
                        console.log('Could not restart background music:', e);
                    });
                }
            }
        } catch (e) {
            console.log('Error restarting audio:', e);
        }
    },
    
    // Fallback exit methods
    tryCloseOrRedirect: function() {
        try {
            // Try to close the window (works if opened via JavaScript)
            window.close();
            
            // If still here after 500ms, try redirect
            setTimeout(function() {
                try {
                    // Redirect to a safe page
                    window.location.href = 'about:blank';
                } catch (e) {
                    // Last resort - reload page
                    window.location.reload();
                }
            }, 500);
            
        } catch (e) {
            console.log('Final exit attempt failed:', e);
        }
    },

    skip: function() {
        console.log('Skip button clicked for step:', State.step);
        
        // Stop all audio
        this.stopAllAudio();
        
        // Clear timers
        if (State.motherInterruptTimer) {
            clearTimeout(State.motherInterruptTimer);
            State.motherInterruptTimer = null;
        }
        
        // Reset speaking state
        State.isSpeaking = false;
        if (typeof UI !== 'undefined') {
            UI.setVisualizerState('active');
            UI.hideAllInteractiveElements();
        }
        
        // Handle current step logic with appropriate default values
        if (typeof DNAButton !== 'undefined') {
            if (DNAButton.currentMode === 'text') {
                setTimeout(function() {
                    DNAButton.handleClick();
                }, 100);
            } else if (DNAButton.currentMode === 'probability') {
                DNAButton.handleProbabilityChoice('medium');
            } else if (DNAButton.currentMode === 'scale') {
                DNAButton.handleScaleChoice(5);
            } else if (DNAButton.currentMode === 'ai') {
                DNAButton.handleAIChoice('diverse');
            } else if (DNAButton.currentMode === 'why-german-input') {
                var whyInput = document.getElementById('whyGermanInput');
                if (whyInput) whyInput.value = 'Skipped';
                DNAButton.handleWhyGermanSubmit();
            } else if (DNAButton.currentMode === 'goal-input') {
                var goalInput = document.getElementById('goalInput');
                if (goalInput) goalInput.value = 'Skipped';
                DNAButton.handleGoalSubmit();
            } else if (DNAButton.currentMode === 'time-input') {
                var timeInput = document.getElementById('timeInput');
                if (timeInput) timeInput.value = '5 hours';
                DNAButton.handleTimeSubmit();
            } else if (DNAButton.currentMode === 'mother-description') {
                var motherInput = document.getElementById('motherDescriptionInput');
                if (motherInput) motherInput.value = 'Skipped';
                DNAButton.handleMotherDescriptionSubmit();
            } else if (DNAButton.currentMode === 'profile') {
                if (typeof Conversation !== 'undefined') {
                    Conversation.dissolveAndTransition();
                }
            } else {
                // Default action - advance to next step
                if (typeof UI !== 'undefined') {
                    UI.setVisualizerState('active');
                }
                setTimeout(function() {
                    if (typeof Conversation !== 'undefined') {
                        Conversation.moveToNextQuestion();
                    }
                }, 300);
            }
        }
    },

    quit: function() {
        if (confirm('Are you sure you want to quit the assessment?')) {
            this.stopAllAudio();
            try {
                window.history.back();
            } catch (e) {
                this.tryCloseOrRedirect();
            }
        }
    }
};