// ===== CONVERSATION FLOW & UI LOGIC - FIXED SIMPLE TRANSITION =====

var DNAButton = {
    currentMode: 'dna',
    
    // === AUDIO FEEDBACK ===
    playConfirmationSound: function() {
        try {
            var confirmAudio = AudioManager.createAudio(State.confirmationSound);
            confirmAudio.volume = Config.settings.audioVolume.effects;
            confirmAudio.play().catch(function(e) {
                console.log('Confirmation sound failed:', e.message);
            });
        } catch (e) {
            console.log('Confirmation sound error:', e.message);
        }
    },
    
    // === ENHANCED TEXT AREA SETUP ===
    setupTextAreaInput: function(inputId, counterId, maxLength) {
        var input = UI.element(inputId);
        var counter = UI.element(counterId);
        
        if (!input || !counter) {
            console.warn('setupTextAreaInput: Missing elements', inputId, counterId);
            return false;
        }
        
        // Clear any existing event listeners by replacing the element
        var newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        input = newInput; // Update reference
        
        // Setup character counter
        var updateCounter = function() {
            var length = input.value.length;
            counter.textContent = length + '/' + maxLength;
            
            // Update counter colors based on usage
            counter.classList.remove('warning', 'danger');
            if (length > maxLength * 0.9) {
                counter.classList.add('danger');
            } else if (length > maxLength * 0.75) {
                counter.classList.add('warning');
            }
        };
        
        // Add event listeners
        input.addEventListener('input', function() {
            updateCounter();
            // Auto-resize textarea
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 200) + 'px';
        });
        
        // Allow Ctrl+Enter or Shift+Enter to submit
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && (e.ctrlKey || e.shiftKey)) {
                e.preventDefault();
                var submitButton = input.parentNode.querySelector('.text-submit-button');
                if (submitButton) submitButton.click();
            }
        });
        
        // Initialize counter and focus
        updateCounter();
        setTimeout(function() {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        }, 300);
        
        return true;
    },

    // === UI DISPLAY METHODS ===
    showText: function(text, translation) {
        console.log('🔴 showText called with:', text, translation, 'Current step:', State.step);
        var visualizer = UI.element('visualizer');
        var textButton = UI.element('dnaTextButton');
        
        if (!textButton || !visualizer) {
            console.error('❌ showText failed - missing elements:', !!textButton, !!visualizer);
            return false;
        }
        
        // Clear any existing content first
        textButton.style.transition = 'all 0.3s ease';
        textButton.style.opacity = '0';
        textButton.style.transform = 'translate(-50%, -50%)';
        textButton.innerHTML = '';
        
        setTimeout(function() {
            var contentSpan = document.createElement('span');
            contentSpan.className = 'dna-text-content';
            contentSpan.textContent = text;
            textButton.appendChild(contentSpan);
            
            if (translation) {
                var translationSpan = document.createElement('span');
                translationSpan.className = 'dna-text-translation';
                translationSpan.textContent = translation;
                textButton.appendChild(translationSpan);
            }
            
            visualizer.classList.add('text-mode');
            textButton.style.transition = 'all 0.8s ease';
            
            setTimeout(function() {
                textButton.classList.add('visible');
                textButton.style.opacity = '1';
                textButton.style.pointerEvents = 'all';
                console.log('✅ Text button now visible:', text);
            }, 100);
            
            DNAButton.currentMode = 'text';
        }, 300);
        
        return true;
    },

    hideText: function() {
        var visualizer = UI.element('visualizer');
        var textButton = UI.element('dnaTextButton');
        
        if (textButton && visualizer) {
            visualizer.classList.remove('text-mode');
            textButton.classList.remove('visible');
            this.currentMode = 'dna';
            return true;
        }
        return false;
    },

    showWhyGermanInput: function() {
        var visualizer = UI.element('visualizer');
        var whyContainer = UI.element('whyGermanInputContainer');
        
        if (whyContainer && visualizer) {
            visualizer.classList.add('text-mode');
            whyContainer.classList.add('visible');
            this.currentMode = 'why-german-input';
            
            // Setup character counter and better event handling
            return this.setupTextAreaInput('whyGermanInput', 'whyGermanCounter', 500);
        }
        return false;
    },

    showGoalInput: function() {
        var visualizer = UI.element('visualizer');
        var goalContainer = UI.element('goalInputContainer');
        
        if (goalContainer && visualizer) {
            visualizer.classList.add('text-mode');
            goalContainer.classList.add('visible');
            this.currentMode = 'goal-input';
            
            return this.setupTextAreaInput('goalInput', 'goalCounter', 500);
        }
        return false;
    },

    showTimeInput: function() {
        var visualizer = UI.element('visualizer');
        var timeContainer = UI.element('timeInputContainer');
        
        if (timeContainer && visualizer) {
            visualizer.classList.add('text-mode');
            timeContainer.classList.add('visible');
            this.currentMode = 'time-input';
            
            return this.setupTextAreaInput('timeInput', 'timeCounter', 300);
        }
        return false;
    },

    showProbabilityChoices: function() {
        var visualizer = UI.element('visualizer');
        var probContainer = UI.element('probabilityChoicesContainer');
        
        if (probContainer && visualizer) {
            visualizer.classList.add('text-mode');
            probContainer.classList.add('visible');
            this.currentMode = 'probability';
            return true;
        }
        return false;
    },

    showScaleChoices: function() {
        var visualizer = UI.element('visualizer');
        var scaleContainer = UI.element('scaleChoicesContainer');
        
        if (scaleContainer && visualizer) {
            visualizer.classList.add('text-mode');
            scaleContainer.classList.add('visible');
            this.currentMode = 'scale';
            console.log('✅ Showing German love scale for step:', State.step);
            return true;
        }
        return false;
    },

    showAIChoices: function() {
        var visualizer = UI.element('visualizer');
        var aiContainer = UI.element('aiChoicesContainer');
        
        if (aiContainer && visualizer) {
            visualizer.classList.add('text-mode');
            aiContainer.classList.add('visible');
            this.currentMode = 'ai';
            return true;
        }
        return false;
    },

    showMotherDescriptionInput: function() {
        var visualizer = UI.element('visualizer');
        var motherContainer = UI.element('motherDescriptionContainer');
        
        if (motherContainer && visualizer) {
            visualizer.classList.add('text-mode');
            motherContainer.classList.add('visible');
            this.currentMode = 'mother-description';
            
            return this.setupTextAreaInput('motherDescriptionInput', 'motherCounter', 500);
        }
        return false;
    },
    
    showDNA: function() {
        UI.hideAllInteractiveElements();
        this.currentMode = 'dna';
    },

    showStatus: function(text, isError) {
        var statusDisplay = UI.element('statusDisplay');
        var visualizer = UI.element('visualizer');
        
        if (statusDisplay && visualizer) {
            visualizer.classList.add('text-mode');
            statusDisplay.textContent = text;
            statusDisplay.classList.remove('error');
            
            if (isError) {
                statusDisplay.classList.add('error');
            }
            
            statusDisplay.classList.add('visible');
            return true;
        }
        return false;
    },

    hideStatus: function() {
        var statusDisplay = UI.element('statusDisplay');
        if (statusDisplay) {
            statusDisplay.classList.remove('visible', 'error');
            return true;
        }
        return false;
    },
    
    // === EVENT HANDLERS ===
    handleClick: function() {
        if (this.currentMode !== 'text') return;
        
        switch(State.step) {
            case 0:
                this.handleBereit();
                break;
            case 11:
                this.handleNaGut();
                break;
        }
    },

    // === CONSISTENT INPUT HANDLERS (USING STATE METHODS) ===
    handleWhyGermanSubmit: function() {
        var self = this;
        var whyInput = UI.element('whyGermanInput');
        var whyValue = whyInput ? whyInput.value.trim() : '';
        
        self.playConfirmationSound();
        
        if (whyValue) {
            State.saveResponse('whyGerman', whyValue);
            self.submitToGoogleForm(whyValue, 'why_german');
        }
        
        self.animateInputContainerOut('whyGermanInputContainer');
        
        setTimeout(function() {
            DNAButton.showDNA();
            Conversation.playThankYou();
        }, 800);
    },

    handleGoalSubmit: function() {
        var self = this;
        var goalInput = UI.element('goalInput');
        var goalValue = goalInput ? goalInput.value.trim() : '';
        
        self.playConfirmationSound();
        
        if (goalValue) {
            self.scoreGoal(goalValue);
            self.submitToGoogleForm(goalValue, 'goal');
        }
        
        self.animateInputContainerOut('goalInputContainer');
        
        setTimeout(function() {
            DNAButton.showDNA();
            Conversation.playThankYou();
        }, 800);
    },

    handleTimeSubmit: function() {
        var self = this;
        var timeInput = UI.element('timeInput');
        var timeValue = timeInput ? timeInput.value.trim() : '';
        
        self.playConfirmationSound();
        
        if (timeValue) {
            var hours = self.parseTimeCommitment(timeValue);
            State.saveResponse('timeCommitment', hours);
            State.saveResponse('timeText', timeValue);
            self.submitToGoogleForm(timeValue, 'time_commitment');
            
            // Add score based on time commitment
            if (hours >= 15) State.addScore(5);
            else if (hours >= 5) State.addScore(3);
            else State.addScore(1);
        }
        
        self.animateInputContainerOut('timeInputContainer');
        
        setTimeout(function() {
            DNAButton.showDNA();
            Conversation.playThankYou();
        }, 800);
    },

    handleProbabilityChoice: function(level) {
        var self = this;
        if (self.currentMode !== 'probability') return;
        
        State.saveResponse('goalLikelihood', level);
        
        // Add score based on confidence level
        var scoreMap = { 'low': -1, 'medium': 2, 'high': 4 };
        State.addScore(scoreMap[level] || 0);
        
        self.playConfirmationSound();
        self.animateChoiceClick();
        
        if (level === 'low') {
            setTimeout(function() {
                window.open(Config.settings.external.unblockCourseUrl, '_blank');
                DNAButton.showDNA();
                Conversation.playThankYou();
            }, 800);
        } else {
            setTimeout(function() {
                DNAButton.showDNA();
                Conversation.playThankYou();
            }, 800);
        }
    },

    handleScaleChoice: function(rating) {
        var self = this;
        console.log('🔵 Scale choice:', rating, 'for step:', State.step);
        
        self.playConfirmationSound();
        self.animateChoiceClick();
        
        if (State.step === 5) {
            State.saveResponse('germanLove', rating);
            State.addScore(Math.max(0, rating - 5));
            console.log('✅ German love rating saved:', rating);
        }
        
        setTimeout(function() {
            DNAButton.showDNA();
            Conversation.playThankYou();
        }, 800);
    },

    handleAIChoice: function(aiType) {
        var self = this;
        self.playConfirmationSound();
        self.animateChoiceClick();
        
        State.saveResponse('aiChoice', aiType);
        
        // Add score based on AI type choice
        var scoreMap = { 'diverse': 3, 'female': 2, 'male': 1 };
        State.addScore(scoreMap[aiType] || 0);
        
        State.selectedAIType = aiType;
        
        setTimeout(function() {
            DNAButton.showDNA();
            Conversation.playThankYou();
        }, 800);
    },

    handleMotherDescriptionSubmit: function() {
        var self = this;
        var motherInput = UI.element('motherDescriptionInput');
        var motherValue = motherInput ? motherInput.value.trim() : '';
        
        self.playConfirmationSound();
        
        if (motherValue) {
            self.scoreMotherDescription(motherValue);
            self.submitToGoogleForm(motherValue, 'mother_description');
        }
        
        self.animateInputContainerOut('motherDescriptionContainer');
        
        setTimeout(function() {
            DNAButton.showDNA();
            Conversation.playThankYou();
        }, 800);
    },
    
    handleBereit: function() {
        var self = this;
        self.playConfirmationSound();
        
        var textButton = UI.element('dnaTextButton');
        if (textButton) {
            textButton.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            textButton.style.opacity = '0';
            textButton.style.transform = 'translate(-50%, -50%) translateY(10px)';
        }
        
        setTimeout(function() {
            DNAButton.showDNA();
            setTimeout(function() {
                Conversation.moveToNextQuestion();
            }, 200);
        }, 800);
    },
    
    handleNaGut: function() {
        var self = this;
        self.playConfirmationSound();
        
        var textButton = UI.element('dnaTextButton');
        if (textButton) {
            textButton.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            textButton.style.opacity = '0';
            textButton.style.transform = 'translate(-50%, -50%) translateY(10px)';
        }
        
        setTimeout(function() {
            DNAButton.showDNA();
            setTimeout(function() {
                // Start final sequence immediately - the 7-second delay already happened in step 10
                Conversation.startFinalSequence();
            }, 200);
        }, 800);
    },

    // === ANIMATION HELPERS ===
    animateChoiceClick: function() {
        var containers = ['answerChoicesContainer', 'timeInputContainer', 'probabilityChoicesContainer', 'scaleChoicesContainer', 'aiChoicesContainer'];
        containers.forEach(function(id) {
            var container = UI.element(id);
            if (container && container.classList.contains('visible')) {
                container.style.opacity = '0';
                container.style.transform = 'translate(-50%, -50%) translateY(10px)';
            }
        });
    },

    animateInputContainerOut: function(containerId) {
        var container = UI.element(containerId);
        if (container) {
            container.style.opacity = '0';
            container.style.transform = 'translate(-50%, -50%) translateY(10px)';
        }
    },

    // === PARSING AND ANALYSIS HELPERS ===
    parseTimeCommitment: function(text) {
        var cleanText = text.toLowerCase();
        var numbers = cleanText.match(/\d+/g);
        
        if (numbers) {
            var num = parseInt(numbers[0]);
            if (cleanText.includes('hour') || cleanText.includes('std') || cleanText.includes('h')) {
                return num;
            } else if (cleanText.includes('minute') || cleanText.includes('min')) {
                return Math.round(num / 60 * 10) / 10;
            }
            return num;
        }
        
        if (cleanText.includes('daily') || cleanText.includes('täglich')) return 7;
        if (cleanText.includes('a lot') || cleanText.includes('viel')) return 10;
        if (cleanText.includes('little') || cleanText.includes('wenig')) return 2;
        
        return 5;
    },

    scoreGoal: function(goal) {
        var self = this;
        var analysis = self.analyzeGoalSentiment(goal);
        var level = self.estimateTargetLevel(goal, analysis);
        
        var score = analysis.ambition + analysis.confidence + analysis.urgency + analysis.specificity;
        
        // Use consistent state methods
        State.saveResponse('goal', score);
        State.saveResponse('goalLevel', level);
        State.saveResponse('goalText', goal);
        State.saveResponse('goalAnalysis', analysis);
        State.addScore(score);
    },

    analyzeGoalSentiment: function(text) {
        var cleanText = text.toLowerCase();
        var analysis = {
            ambition: 0,
            confidence: 0,
            urgency: 0,
            specificity: 0,
            context: 'general'
        };
        
        // Basic sentiment analysis - can be enhanced
        if (cleanText.includes('fluent') || cleanText.includes('advanced')) analysis.ambition += 2;
        if (cleanText.includes('basic') || cleanText.includes('beginner')) analysis.ambition += 1;
        if (cleanText.includes('will') || cleanText.includes('going to')) analysis.confidence += 2;
        if (cleanText.includes('might') || cleanText.includes('maybe')) analysis.confidence += 1;
        if (cleanText.includes('month') || cleanText.includes('week')) analysis.urgency += 2;
        if (cleanText.includes('year') || cleanText.includes('eventually')) analysis.urgency += 1;
        if (cleanText.length > 50) analysis.specificity += 2;
        else if (cleanText.length > 20) analysis.specificity += 1;
        
        return analysis;
    },

    estimateTargetLevel: function(text, analysis) {
        var cleanText = text.toLowerCase();
        
        if (cleanText.includes('fluent') || cleanText.includes('c1') || cleanText.includes('c2')) return 5;
        if (cleanText.includes('advanced') || cleanText.includes('b2')) return 4;
        if (cleanText.includes('intermediate') || cleanText.includes('b1')) return 3;
        if (cleanText.includes('pre-intermediate') || cleanText.includes('a2')) return 2;
        if (cleanText.includes('beginner') || cleanText.includes('a1')) return 1;
        
        // Default to B1 based on analysis
        return 3;
    },

    scoreMotherDescription: function(description) {
        var self = this;
        var analysis = self.analyzeMotherSentiment(description);
        var score = analysis.relationship + analysis.emotional + analysis.communication + analysis.humor;
        
        // Use consistent state methods
        State.saveResponse('motherDescription', score);
        State.saveResponse('motherAnalysis', analysis);
        State.addScore(score);
    },

    analyzeMotherSentiment: function(text) {
        var cleanText = text.toLowerCase();
        
        // Basic sentiment analysis for mother relationship
        var analysis = {
            relationship: 1,
            emotional: 1,
            communication: 1,
            humor: 1,
            type: 'normal'
        };
        
        // Positive indicators
        if (cleanText.includes('love') || cleanText.includes('great') || cleanText.includes('wonderful')) {
            analysis.relationship += 1;
            analysis.emotional += 1;
        }
        
        // Communication indicators
        if (cleanText.includes('talk') || cleanText.includes('listen') || cleanText.includes('understand')) {
            analysis.communication += 1;
        }
        
        // Humor indicators
        if (cleanText.includes('funny') || cleanText.includes('laugh') || cleanText.includes('joke')) {
            analysis.humor += 1;
        }
        
        // Complexity indicators
        if (cleanText.includes('complicated') || cleanText.includes('difficult')) {
            analysis.type = 'complex';
        }
        
        return analysis;
    },

    // === GOOGLE FORM SUBMISSION ===
    submitToGoogleForm: function(value, type) {
        try {
            var baseUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSc-hRZpWi9wo0j9xMtrAStg1ivm_i420KNFFEY5qoeP1zUFVQ/formResponse';
            
            var fieldMap = {
                'why_german': 'entry.836554877',
                'goal': 'entry.1685277614',
                'time_commitment': 'entry.1810441905',
                'mother_description': 'entry.745882257'
            };
            
            var fieldName = fieldMap[type] || 'entry.1685277614';
            
            var params = new URLSearchParams();
            params.append(fieldName, value);
            params.append('submit', 'Submit');
            
            fetch(baseUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString()
            }).then(function() {
                console.log('✅ SUBMITTED TO GOOGLE SHEET:', type, '=', value);
            }).catch(function(e) {
                console.log('❌ SUBMISSION ERROR:', e.message);
            });
            
        } catch (e) {
            console.log('❌ GOOGLE SHEET SUBMISSION ERROR:', e.message);
        }
    },

    // === PERSONALITY PROFILE GENERATION WITH VARIANTS ===
    getPersonalityProfile: function() {
        var score = State.score;
        var profiles = Config.personalityProfiles;
        
        var level = State.responses.goalLevel || 3;
        var hoursPerWeek = State.responses.timeCommitment || 5;
        var totalHours = level * 200;
        var weeks = Math.ceil(totalHours / hoursPerWeek);
        
        var timeString = this.formatTimeEstimate(weeks);
        
        for (var i = 0; i < profiles.length; i++) {
            var profile = profiles[i];
            if (score >= profile.scoreRange[0] && score <= profile.scoreRange[1]) {
                // Select random variant
                var variants = profile.variants || [profile];
                var selectedVariant = variants[Math.floor(Math.random() * variants.length)];
                
                return {
                    title: selectedVariant.title,
                    description: selectedVariant.description + '\n\nYou should reach your German goal in approximately ' + timeString + ' (' + totalHours + ' hours).'
                };
            }
        }
        
        // Default to realist with variant selection
        var defaultProfile = profiles[2];
        var variants = defaultProfile.variants || [defaultProfile];
        var selectedVariant = variants[Math.floor(Math.random() * variants.length)];
        
        return {
            title: selectedVariant.title,
            description: selectedVariant.description + '\n\nYou should reach your German goal in approximately ' + timeString + ' (' + totalHours + ' hours).'
        };
    },

    formatTimeEstimate: function(weeks) {
        var years = Math.floor(weeks / 52);
        var months = Math.floor((weeks % 52) / 4.33);
        
        if (years > 0) {
            return years + (years === 1 ? ' year' : ' years');
        } else if (months > 0) {
            return months + (months === 1 ? ' month' : ' months');
        } else {
            return weeks + (weeks === 1 ? ' week' : ' weeks');
        }
    },

    showPersonalityProfile: function() {
        var self = this;
        var profile = self.getPersonalityProfile();
        var visualizer = UI.element('visualizer');
        var profileContainer = UI.element('profileContainer');
        var profileTitle = UI.element('profileTitle');
        var profileDescription = UI.element('profileDescription');
        
        if (profileContainer && visualizer && profileTitle && profileDescription) {
            visualizer.classList.add('text-mode');
            profileTitle.textContent = profile.title;
            profileDescription.textContent = profile.description;
            profileContainer.classList.add('visible');
            self.currentMode = 'profile';
            
            console.log('✅ Personality profile displayed:', profile.title);
            return true;
        }
        console.error('❌ Failed to show personality profile - missing elements');
        return false;
    }
};

// ===== CONVERSATION CONTROLLER - SIMPLIFIED TRANSITION =====
var Conversation = {
    playThankYou: function() {
        State.isSpeaking = true;
        UI.setVisualizerState('speaking');
        
        if (WebAudioHelper.isMobile && State.audioUnlocked && window.AudioContext) {
            WebAudioHelper.play(
                State.thankYouAudio,
                function() {
                    State.isSpeaking = false;
                    UI.setVisualizerState('active');
                    setTimeout(function() { Conversation.moveToNextQuestion(); }, 1000);
                },
                function(e) {
                    State.isSpeaking = false;
                    setTimeout(function() { Conversation.moveToNextQuestion(); }, 1000);
                }
            );
        } else {
            var audio = AudioManager.createAudio(State.thankYouAudio);
            audio.onended = function() {
                State.isSpeaking = false;
                UI.setVisualizerState('active');
                setTimeout(function() { Conversation.moveToNextQuestion(); }, 1000);
            };
            audio.onerror = function(e) {
                State.isSpeaking = false;
                setTimeout(function() { Conversation.moveToNextQuestion(); }, 1000);
            };
            audio.play().catch(function(e) {
                State.isSpeaking = false;
                setTimeout(function() { Conversation.moveToNextQuestion(); }, 1000);
            });
        }
    },

    moveToNextQuestion: function() {
        State.nextStep();
        console.log('🔄 Moving to step:', State.step);
        
        // FIXED: Handle AI sequence branching with proper step control
        if (State.step === 8) {
            if (State.selectedAIType === 'male') {
                this.startMaleAISequence();
                return;
            } else if (State.selectedAIType === 'female') {
                this.startFemaleAISequence();
                return;
            } else if (State.selectedAIType === 'diverse') {
                this.startDiverseAISequence();
                return;
            }
        }
        
        if (State.isComplete()) {
            this.completeCourse();
            return;
        }
        
        // FIXED: Only play welcome audio on step 0, not when skipping
        if (State.step === 0 && !State.hasSkippedToStep0) {
            State.isSpeaking = true;
            UI.setVisualizerState('speaking');
            
            var audioUrl = State.audioFiles[State.step];
            console.log('🔊 Playing audio for step:', State.step, audioUrl);
            
            this.playStepAudio(audioUrl, function() {
                State.isSpeaking = false;
                UI.setVisualizerState('active');
                Conversation.showNextButton();
            });
        } else if (State.step > 0) {
            // For all other steps, play audio normally
            State.isSpeaking = true;
            UI.setVisualizerState('speaking');
            
            var audioUrl = State.audioFiles[State.step];
            console.log('🔊 Playing audio for step:', State.step, audioUrl);
            
            this.playStepAudio(audioUrl, function() {
                State.isSpeaking = false;
                UI.setVisualizerState('active');
                Conversation.showNextButton();
            });
        } else {
            // Skip audio and go directly to UI
            console.log('⏭️ Skipping audio for step 0, showing UI directly');
            State.isSpeaking = false;
            UI.setVisualizerState('active');
            this.showNextButton();
        }
    },

    // === CENTRALIZED AUDIO PLAYBACK ===
    playStepAudio: function(audioUrl, onComplete) {
        var onError = function(e) {
            console.warn('Step audio error:', e);
            State.isSpeaking = false;
            UI.setVisualizerState('active');
            if (onComplete) onComplete();
        };

        if (WebAudioHelper.isMobile && State.audioUnlocked && window.AudioContext) {
            WebAudioHelper.play(audioUrl, onComplete, onError);
        } else {
            var audio = AudioManager.createAudio(audioUrl);
            audio.onended = onComplete;
            audio.onerror = onError;
            audio.play().catch(onError);
        }
    },

    // FIXED: Remove race conditions - steps 8, 9, 11 no longer auto-schedule moveToNextQuestion()
    showNextButton: function() {
        setTimeout(function() {
            console.log('📋 Showing UI for step:', State.step);
            switch(State.step) {
                case 0:
                    DNAButton.showText('Bereit', 'Ready');
                    break;
                case 1:
                    DNAButton.showWhyGermanInput();
                    break;
                case 2:
                    DNAButton.showGoalInput();
                    break;
                case 3:
                    DNAButton.showTimeInput();
                    break;
                case 4:
                    DNAButton.showProbabilityChoices();
                    break;
                case 5:
                    DNAButton.showScaleChoices();
                    break;
                case 6:
                    DNAButton.showMotherDescriptionInput();
                    break;
                case 7:
                    DNAButton.showAIChoices();
                    break;
                case 8:
                    // FIXED: Removed auto-progression - handled by AI sequences
                    break;
                case 9:
                    // FIXED: Only play analysis audio, don't schedule moveToNextQuestion()
                    console.log('🔊 Step 9: Playing analysis audio');
                    Conversation.playAnalysisAudio();
                    break;
                case 10:
                    // FIXED: 7 second delay before "Another gifted one"
                    console.log('⏰ Step 10: 7 second delay before "Another gifted one"');
                    setTimeout(function() {
                        Conversation.moveToNextQuestion();
                    }, 7000);
                    break;
                case 11:
                    // FIXED: Only play "Another gifted one" audio, don't schedule moveToNextQuestion()
                    console.log('🔊 Step 11: Playing "Another gifted one" audio');
                    Conversation.playAnotherGiftedOneAudio();
                    break;
                default:
                    break;
            }
        }, Config.settings.timing.responseDelay);
    },

    // === FIXED AI SEQUENCE HANDLERS - Direct control with proper progression ===
    startMaleAISequence: function() {
        var self = this;
        console.log('🔊 Starting Male AI confirmation - playing audio file 8');
        self.playAISequenceAudio(State.aiTypeMaleAudio, 'male', function() {
            // FIXED: Direct control - no race conditions
            State.nextStep(); // Move to step 9
            setTimeout(function() {
                Conversation.playAnalysisAudio(); // Step 9 audio
            }, 1000);
        });
    },

    startFemaleAISequence: function() {
        var self = this;
        console.log('🔊 Starting Female AI confirmation - playing audio file 9');
        self.playAISequenceAudio(State.aiTypeFemaleAudio, 'female', function() {
            // FIXED: Direct control - no race conditions
            State.nextStep(); // Move to step 9
            setTimeout(function() {
                Conversation.playAnalysisAudio(); // Step 9 audio
            }, 1000);
        });
    },

    startDiverseAISequence: function() {
        var self = this;
        console.log('🔊 Starting Diverse AI confirmation - playing audio file 10:', State.aiTypeDiverseAudio);
        self.playAISequenceAudio(State.aiTypeDiverseAudio, 'diverse', function() {
            // FIXED: Direct control - no race conditions
            State.nextStep(); // Move to step 9
            setTimeout(function() {
                Conversation.playAnalysisAudio(); // Step 9 audio
            }, 1000);
        });
    },

    // === UNIFIED AI SEQUENCE AUDIO HANDLER ===
    playAISequenceAudio: function(audioUrl, aiType, onComplete) {
        var self = this;
        
        State.isSpeaking = true;
        UI.setVisualizerState('speaking');
        
        console.log('🔊 Playing', aiType, 'AI sequence audio:', audioUrl);
        
        var handleComplete = function() {
            State.isSpeaking = false;
            UI.setVisualizerState('active');
            console.log('🔄', aiType, 'AI sequence complete');
            if (onComplete) onComplete();
        };

        var handleError = function(e) {
            console.warn('AI sequence audio error:', e);
            State.isSpeaking = false;
            UI.setVisualizerState('active');
            if (onComplete) onComplete();
        };
        
        self.playStepAudio(audioUrl, handleComplete);
    },

    // === FIXED: Analysis audio handler with proper step progression ===
    playAnalysisAudio: function() {
        var self = this;
        
        State.isSpeaking = true;
        UI.setVisualizerState('speaking');
        
        console.log('🔊 Playing analysis audio:', State.analysingInputAudio);
        
        var handleComplete = function() {
            State.isSpeaking = false;
            UI.setVisualizerState('active');
            console.log('🔄 Analysis audio complete, moving to step 10');
            
            // FIXED: Direct step control
            State.nextStep(); // Move to step 10
            setTimeout(function() {
                // Step 10: 7 second delay
                console.log('⏰ Step 10: 7 second delay before "Another gifted one"');
                setTimeout(function() {
                    State.nextStep(); // Move to step 11
                    Conversation.playAnotherGiftedOneAudio();
                }, 7000);
            }, 1000);
        };

        var handleError = function(e) {
            console.warn('Analysis audio error:', e);
            State.isSpeaking = false;
            UI.setVisualizerState('active');
            handleComplete(); // Continue flow even on error
        };
        
        self.playStepAudio(State.analysingInputAudio, handleComplete);
    },

    // === FIXED: "Another gifted one" audio handler ===
    playAnotherGiftedOneAudio: function() {
        var self = this;
        
        State.isSpeaking = true;
        UI.setVisualizerState('speaking');
        
        console.log('🔊 Playing "Another gifted one" audio:', State.audioFiles[11]);
        
        var handleComplete = function() {
            State.isSpeaking = false;
            UI.setVisualizerState('active');
            console.log('🔄 "Another gifted one" audio complete, showing Na gut button');
            setTimeout(function() {
                DNAButton.showText('Na gut', 'Oh well');
            }, 1000);
        };

        var handleError = function(e) {
            console.warn('"Another gifted one" audio error:', e);
            State.isSpeaking = false;
            UI.setVisualizerState('active');
            handleComplete(); // Continue flow even on error
        };
        
        self.playStepAudio(State.audioFiles[11], handleComplete);
    },

    // === FINAL SEQUENCE WITH PROPER PROFILE DISPLAY ===
    startFinalSequence: function() {
        var self = this;
        
        // Prevent multiple executions
        if (State.inFinalSequence) {
            console.log('⚠️ Final sequence already running, skipping...');
            return;
        }
        State.inFinalSequence = true;
        
        console.log('🎬 Starting final sequence...');
        
        setTimeout(function() {
            DNAButton.showStatus('Analysing German language...');
        }, 500);
        
        setTimeout(function() {
            self.showComplexityCounter();
        }, 2500);
        
        setTimeout(function() {
            DNAButton.hideStatus();
            
            setTimeout(function() {
                console.log('🎵 Playing system error audio now...');
                self.playSystemErrorAudio();
            }, 100);
            
            setTimeout(function() {
                DNAButton.showStatus('Subject surpassing AI capabilities', true);
            }, 500);
        }, 8000);
        
        setTimeout(function() {
            DNAButton.hideStatus();
            
            setTimeout(function() {
                console.log('🎵 Playing human wakeup audio...');
                self.playHumanWakeupAudio();
            }, 100);
            
            setTimeout(function() {
                DNAButton.showStatus('Falling back to Human Intelligence');
            }, 500);
        }, 10500);
        
        setTimeout(function() {
            DNAButton.hideStatus();
            setTimeout(function() {
                console.log('🎭 Showing personality profile...');
                if (DNAButton.showPersonalityProfile()) {
                    // Profile was shown successfully, wait 7 seconds then dissolve
                    setTimeout(function() {
                        self.dissolveAndTransition();
                    }, 7000);
                } else {
                    // Profile failed to show, proceed directly to dissolve
                    console.warn('⚠️ Profile display failed, proceeding to dissolve');
                    setTimeout(function() {
                        self.dissolveAndTransition();
                    }, 1000);
                }
            }, 1000);
        }, 13000);
    },

    playSystemErrorAudio: function() {
        var audio = AudioManager.createAudio(State.systemErrorAudio);
        audio.volume = Config.settings.audioVolume.effects;
        
        // Start fading out background music
        var music = UI.element('backgroundMusic');
        if (music && SG1.musicEnabled && music.volume > 0) {
            var fadeSteps = 15;
            var fadeInterval = 150;
            var volumeStep = music.volume / fadeSteps;
            
            var fadeOut = setInterval(function() {
                if (music.volume > volumeStep) {
                    music.volume = Math.max(0, music.volume - volumeStep);
                } else {
                    music.volume = 0.1;
                    clearInterval(fadeOut);
                }
            }, fadeInterval);
        }
        
        audio.play().catch(function(e) {
            console.log('System error audio failed:', e.message);
        });
    },

    playHumanWakeupAudio: function() {
        var audio = AudioManager.createAudio(State.humanWakeupAudio);
        audio.volume = Config.settings.audioVolume.effects;
        
        // Fade out background music completely
        var music = UI.element('backgroundMusic');
        if (music && SG1.musicEnabled && music.volume > 0) {
            var fadeSteps = 20;
            var fadeInterval = 100;
            var volumeStep = music.volume / fadeSteps;
            
            var fadeOut = setInterval(function() {
                if (music.volume > volumeStep) {
                    music.volume = Math.max(0, music.volume - volumeStep);
                } else {
                    music.volume = 0;
                    clearInterval(fadeOut);
                }
            }, fadeInterval);
        }
        
        audio.onended = function() {
            // Restore music volume gradually
            if (music && SG1.musicEnabled) {
                var targetVolume = Config.settings.audioVolume.background;
                var restoreSteps = 10;
                var restoreInterval = 150;
                var restoreVolumeStep = targetVolume / restoreSteps;
                
                var fadeIn = setInterval(function() {
                    if (music.volume < targetVolume - restoreVolumeStep) {
                        music.volume = Math.min(targetVolume, music.volume + restoreVolumeStep);
                    } else {
                        music.volume = targetVolume;
                        clearInterval(fadeIn);
                    }
                }, restoreInterval);
            }
        };
        
        audio.play().catch(function(e) {
            console.log('Human wakeup audio failed:', e.message);
        });
    },

    showComplexityCounter: function() {
        var statusDisplay = UI.element('statusDisplay');
        var visualizer = UI.element('visualizer');
        
        if (statusDisplay && visualizer) {
            visualizer.classList.add('text-mode');
            statusDisplay.classList.remove('error');
            statusDisplay.classList.add('visible');
            
            var count = 0;
            var interval = setInterval(function() {
                count += Math.floor(Math.random() * 50) + 25;
                if (count >= 1000) {
                    clearInterval(interval);
                    statusDisplay.textContent = 'Complexity: ERROR';
                    statusDisplay.classList.add('error');
                } else {
                    statusDisplay.textContent = 'Complexity: ' + count + '%';
                }
            }, 200);
        }
    },

    // === SIMPLIFIED TRANSITION (LIKE ORIGINAL HTML) ===
    dissolveAndTransition: function() {
        console.log('🌫️ Starting dissolve and transition...');
        
        var dissolveOverlay = UI.element('dissolveOverlay');
        
        if (dissolveOverlay) {
            dissolveOverlay.classList.add('active');
            console.log('🌫️ Dissolve overlay activated');
            
            // Wait 3 seconds then try to advance (like original)
            setTimeout(function() {
                Conversation.completeCourse();
            }, 3000);
        } else {
            console.log('⚠️ No dissolve overlay found, proceeding directly...');
            setTimeout(function() {
                Conversation.completeCourse();
            }, 1000);
        }
    },

    // === PARENT URL DETECTION FOR LEVEL =====
    detectLevelFromParentURL: function() {
        console.log('🔍 Attempting to detect level from parent URL...');
        
        try {
            // Get parent URL (iframe parent)
            var parentUrl = '';
            
            // Try different methods to get parent URL
            if (window.parent !== window) {
                try {
                    parentUrl = window.parent.location.href;
                    console.log('✅ Got parent URL directly:', parentUrl);
                } catch (e) {
                    // Cross-origin - try document.referrer
                    parentUrl = document.referrer;
                    console.log('✅ Got parent URL from referrer:', parentUrl);
                }
            }
            
            if (!parentUrl) {
                console.log('❌ Could not get parent URL');
                return null;
            }
            
            // Convert to lowercase for matching
            var urlLower = parentUrl.toLowerCase();
            
            // Check for level indicators in the URL
            // Look for patterns like: a1-beginners, a2-elementary, etc.
            if (urlLower.includes('a1-beginner') || urlLower.includes('a1_beginner')) {
                return 'A1';
            } else if (urlLower.includes('a2-elementary') || urlLower.includes('a2_elementary')) {
                return 'A2';
            } else if (urlLower.includes('b1-intermediate') || urlLower.includes('b1_intermediate')) {
                return 'B1';
            } else if (urlLower.includes('b2-upper') || urlLower.includes('b2_upper')) {
                return 'B2';
            } else if (urlLower.includes('c1-advanced') || urlLower.includes('c1_advanced')) {
                return 'C1';
            }
            
            // Alternative: Look for just the level codes
            if (urlLower.includes('/a1/') || urlLower.includes('-a1-')) {
                return 'A1';
            } else if (urlLower.includes('/a2/') || urlLower.includes('-a2-')) {
                return 'A2';
            } else if (urlLower.includes('/b1/') || urlLower.includes('-b1-')) {
                return 'B1';
            } else if (urlLower.includes('/b2/') || urlLower.includes('-b2-')) {
                return 'B2';
            } else if (urlLower.includes('/c1/') || urlLower.includes('-c1-')) {
                return 'C1';
            }
            
            console.log('⚠️ No level pattern found in URL:', parentUrl);
            return null;
            
        } catch (e) {
            console.log('❌ Error detecting level from parent URL:', e);
            return null;
        }
    },

    // === COURSE COMPLETION WITH PARENT URL DETECTION ===
    completeCourse: function() {
        console.log('🎉 Course completed! Attempting transition...');
        console.log('📍 Current URL:', window.location.href);
        console.log('📍 In iframe?', window.parent !== window);
        
        // Define next lecture URLs for each level
        var nextLectureUrls = {
            'A1': '/lectures/49317891',
            'A2': '/lectures/60771293',
            'B1': '/lectures/60771639',
            'B2': '/lectures/60771936',
            'C1': '/lectures/36642764'
        };
        
        setTimeout(function() {
            var detectedLevel = null;
            
            console.log('🔍 Method 1: Checking parent URL...');
            // Method 1: Try to detect from parent URL (iframe)
            detectedLevel = Conversation.detectLevelFromParentURL();
            console.log('   Result:', detectedLevel || 'Not detected');
            
            if (detectedLevel && nextLectureUrls[detectedLevel]) {
                console.log('✅ SUCCESS! Level from parent URL:', detectedLevel);
                console.log('✅ Redirecting to:', nextLectureUrls[detectedLevel]);
                console.log('🚀 NAVIGATING NOW...');
                window.top.location.href = nextLectureUrls[detectedLevel]; // Use window.top for iframe navigation
                return;
            }
            
            console.log('🔍 Method 2: Checking data-sg1-level attribute...');
            // Method 2: Check for data-sg1-level attribute
            var levelElement = document.querySelector('[data-sg1-level]');
            console.log('   Found element:', !!levelElement);
            
            if (levelElement) {
                detectedLevel = levelElement.getAttribute('data-sg1-level');
                console.log('   Level value:', detectedLevel);
                
                if (nextLectureUrls[detectedLevel]) {
                    console.log('✅ SUCCESS! Level from attribute:', detectedLevel);
                    console.log('✅ Redirecting to:', nextLectureUrls[detectedLevel]);
                    console.log('🚀 NAVIGATING NOW...');
                    window.top.location.href = nextLectureUrls[detectedLevel];
                    return;
                }
            }
            
            console.log('🔍 Method 3: Checking page title...');
            // Method 3: Scan page title for level
            var pageTitle = document.title || '';
            var titleLower = pageTitle.toLowerCase();
            console.log('   Page title:', pageTitle);
            
            for (var levelKey in nextLectureUrls) {
                if (titleLower.indexOf(levelKey.toLowerCase()) !== -1) {
                    console.log('✅ SUCCESS! Level from title:', levelKey);
                    console.log('✅ Redirecting to:', nextLectureUrls[levelKey]);
                    console.log('🚀 NAVIGATING NOW...');
                    window.top.location.href = nextLectureUrls[levelKey];
                    return;
                }
            }
            
            console.log('🔍 Method 4: Looking for completion buttons...');
            // Method 4: Look for any completion button (fallback)
            var buttons = document.querySelectorAll('button, .btn, [role="button"], .lecture-button, .next-button, .complete-and-continue');
            console.log('   Found buttons:', buttons.length);
            
            for (var i = 0; i < buttons.length; i++) {
                var btn = buttons[i];
                var text = btn.textContent.toLowerCase();
                console.log('   Button ' + i + ':', text.substring(0, 50));
                
                if (text.indexOf('complete') !== -1 || 
                    text.indexOf('continue') !== -1 || 
                    text.indexOf('next') !== -1 ||
                    text.indexOf('weiter') !== -1) {
                    console.log('✅ SUCCESS! Found completion button:', text);
                    console.log('🚀 CLICKING BUTTON...');
                    btn.click();
                    return;
                }
            }
            
            // Try one more aggressive approach - scan parent window
            console.log('🔍 Method 5: Scanning parent window for buttons...');
            try {
                if (window.parent !== window) {
                    var parentButtons = window.parent.document.querySelectorAll('button, .btn, [role="button"], .complete-and-continue');
                    console.log('   Found parent buttons:', parentButtons.length);
                    
                    for (var j = 0; j < parentButtons.length; j++) {
                        var pBtn = parentButtons[j];
                        var pText = pBtn.textContent.toLowerCase();
                        
                        if (pText.indexOf('complete') !== -1 || pText.indexOf('continue') !== -1) {
                            console.log('✅ SUCCESS! Found parent button:', pText);
                            console.log('🚀 CLICKING PARENT BUTTON...');
                            pBtn.click();
                            return;
                        }
                    }
                }
            } catch (e) {
                console.log('   Could not access parent window (cross-origin)');
            }
            
            // FINAL: Just force navigation to A1 as emergency fallback
            console.log('❌ ALL METHODS FAILED!');
            console.log('🚨 EMERGENCY: Forcing navigation to A1 next lecture...');
            console.log('Debug info:');
            console.log('  - Current URL:', window.location.href);
            console.log('  - Parent URL detection:', Conversation.detectLevelFromParentURL());
            console.log('  - Available levels:', Object.keys(nextLectureUrls).join(', '));
            
            // Force navigate to A1 as last resort
            console.log('🚀 FORCING NAVIGATION TO A1...');
            window.top.location.href = nextLectureUrls['A1'];
            
        }, 2000); // 2 seconds delay
    },

    startQ1: function() {
        var isMobile = Config.platform.isMobile;
        if (isMobile && State.mobileAudioStarted) return;
        
        UI.setVisualizerState('active');
        State.updateProgress();
        State.step = 0;
        
        var url = State.audioFiles[0];
        UI.setVisualizerState('speaking');
        
        this.playStepAudio(url, function() {
            UI.setVisualizerState('active');
            setTimeout(function() { 
                DNAButton.showText('Bereit', 'Ready'); 
            }, 2000);
        });
    }
};