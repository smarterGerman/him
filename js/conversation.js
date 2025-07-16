// ===== CONVERSATION FLOW & UI LOGIC - FIXED AUDIO ISSUES =====

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
        var whyInput = UI.element('whyGermanInput');
        var whyValue = whyInput ? whyInput.value.trim() : '';
        
        this.playConfirmationSound();
        
        if (whyValue) {
            State.saveResponse('whyGerman', whyValue);
            this.submitToGoogleForm(whyValue, 'why_german');
        }
        
        this.animateInputContainerOut('whyGermanInputContainer');
        
        setTimeout(function() {
            DNAButton.showDNA();
            Conversation.playThankYou();
        }, 800);
    },

    handleGoalSubmit: function() {
        var goalInput = UI.element('goalInput');
        var goalValue = goalInput ? goalInput.value.trim() : '';
        
        this.playConfirmationSound();
        
        if (goalValue) {
            this.scoreGoal(goalValue);
            this.submitToGoogleForm(goalValue, 'goal');
        }
        
        this.animateInputContainerOut('goalInputContainer');
        
        setTimeout(function() {
            DNAButton.showDNA();
            Conversation.playThankYou();
        }, 800);
    },

    handleTimeSubmit: function() {
        var timeInput = UI.element('timeInput');
        var timeValue = timeInput ? timeInput.value.trim() : '';
        
        this.playConfirmationSound();
        
        if (timeValue) {
            var hours = this.parseTimeCommitment(timeValue);
            State.saveResponse('timeCommitment', hours);
            State.saveResponse('timeText', timeValue);
            this.submitToGoogleForm(timeValue, 'time_commitment');
            
            // Add score based on time commitment
            if (hours >= 15) State.addScore(5);
            else if (hours >= 5) State.addScore(3);
            else State.addScore(1);
        }
        
        this.animateInputContainerOut('timeInputContainer');
        
        setTimeout(function() {
            DNAButton.showDNA();
            Conversation.playThankYou();
        }, 800);
    },

    handleProbabilityChoice: function(level) {
        if (this.currentMode !== 'probability') return;
        
        State.saveResponse('goalLikelihood', level);
        
        // Add score based on confidence level
        var scoreMap = { 'low': -1, 'medium': 2, 'high': 4 };
        State.addScore(scoreMap[level] || 0);
        
        this.playConfirmationSound();
        this.animateChoiceClick();
        
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
        console.log('🔵 Scale choice:', rating, 'for step:', State.step);
        
        this.playConfirmationSound();
        this.animateChoiceClick();
        
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
        this.playConfirmationSound();
        this.animateChoiceClick();
        
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
        var motherInput = UI.element('motherDescriptionInput');
        var motherValue = motherInput ? motherInput.value.trim() : '';
        
        this.playConfirmationSound();
        
        if (motherValue) {
            this.scoreMotherDescription(motherValue);
            this.submitToGoogleForm(motherValue, 'mother_description');
        }
        
        this.animateInputContainerOut('motherDescriptionContainer');
        
        setTimeout(function() {
            DNAButton.showDNA();
            Conversation.playThankYou();
        }, 800);
    },
    
    handleBereit: function() {
        this.playConfirmationSound();
        
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
        this.playConfirmationSound();
        
        var textButton = UI.element('dnaTextButton');
        if (textButton) {
            textButton.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            textButton.style.opacity = '0';
            textButton.style.transform = 'translate(-50%, -50%) translateY(10px)';
        }
        
        setTimeout(function() {
            DNAButton.showDNA();
            setTimeout(function() {
                // ADDED: 3 seconds delay before playing "Another gifted one" audio
                setTimeout(function() {
                    Conversation.startFinalSequence();
                }, 3000);
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
        var analysis = this.analyzeGoalSentiment(goal);
        var level = this.estimateTargetLevel(goal, analysis);
        
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
        var analysis = this.analyzeMotherSentiment(description);
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
        var profile = this.getPersonalityProfile();
        var visualizer = UI.element('visualizer');
        var profileContainer = UI.element('profileContainer');
        var profileTitle = UI.element('profileTitle');
        var profileDescription = UI.element('profileDescription');
        
        if (profileContainer && visualizer && profileTitle && profileDescription) {
            visualizer.classList.add('text-mode');
            profileTitle.textContent = profile.title;
            profileDescription.textContent = profile.description;
            profileContainer.classList.add('visible');
            this.currentMode = 'profile';
            
            // Auto-dissolve after showing profile for 7 seconds
            setTimeout(function() {
                Conversation.startFinalSequence();
            }, 7000);
            
            return true;
        }
        return false;
    }
};

// ===== CONVERSATION CONTROLLER - FIXED AI SEQUENCE ISSUES =====
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
                case 9:
                case 10:
                    // Auto-progression steps
                    setTimeout(function() {
                        Conversation.moveToNextQuestion();
                    }, 2000);
                    break;
                case 11:
                    DNAButton.showText('Na gut', 'Oh well');
                    break;
                default:
                    break;
            }
        }, Config.settings.timing.responseDelay);
    },

    // === FIXED AI SEQUENCE HANDLERS ===
    startMaleAISequence: function() {
        console.log('🔊 Starting Male AI sequence');
        this.playAISequenceAudio(State.aiTypeMaleAudio, 'male', function() {
            // FIXED: Jump to step 11 after male sequence, skipping other AI audios
            State.step = 10; // Will be incremented to 11 in moveToNextQuestion
            setTimeout(function() {
                Conversation.moveToNextQuestion();
            }, 1000);
        });
    },

    startFemaleAISequence: function() {
        console.log('🔊 Starting Female AI sequence');
        this.playAISequenceAudio(State.aiTypeFemaleAudio, 'female', function() {
            // FIXED: Jump to step 11 after female sequence, skipping other AI audios
            State.step = 10; // Will be incremented to 11 in moveToNextQuestion
            setTimeout(function() {
                Conversation.moveToNextQuestion();
            }, 1000);
        });
    },

    startDiverseAISequence: function() {
        console.log('🔊 Starting Diverse AI sequence');
        this.playAISequenceAudio(State.aiTypeDiverseAudio, 'diverse', function() {
            // FIXED: Jump to step 11 after diverse sequence
            State.step = 10; // Will be incremented to 11 in moveToNextQuestion
            setTimeout(function() {
                Conversation.moveToNextQuestion();
            }, 1000);
        });
    },

    // === UNIFIED AI SEQUENCE AUDIO HANDLER - FIXED ===
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
        
        this.playStepAudio(audioUrl, handleComplete);
    },

    startFinalSequence: function() {
        var self = this;
        
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
                DNAButton.showPersonalityProfile();
            }, 1000);
        }, 13000);
        
        setTimeout(function() {
            self.dissolveAndTransition();
        }, 20000);
    },

    playSystemErrorAudio: function() {
        console.log('🔊 Attempting to play system error audio...');
        
        var audio = AudioManager.createAudio(State.systemErrorAudio);
        audio.volume = Config.settings.audioVolume.effects;
        audio.preload = 'auto';
        
        // Start fading out background music when system error begins
        var music = UI.element('backgroundMusic');
        if (music && SG1.musicEnabled && music.volume > 0) {
            var originalVolume = music.volume;
            var fadeSteps = 15;
            var fadeInterval = 150;
            var volumeStep = originalVolume / fadeSteps;
            
            var fadeOut = setInterval(function() {
                if (music.volume > volumeStep) {
                    music.volume = Math.max(0, music.volume - volumeStep);
                } else {
                    music.volume = 0.1; // Keep very low volume, don't mute completely yet
                    clearInterval(fadeOut);
                    console.log('🔇 Background music faded to low volume for system error');
                }
            }, fadeInterval);
        }
        
        audio.onloadeddata = function() {
            console.log('✅ System error audio loaded successfully');
        };
        
        audio.onended = function() {
            console.log('✅ System error audio completed');
        };
        
        audio.onerror = function(e) {
            console.log('❌ System error audio failed:', e);
        };
        
        var playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(function() {
                console.log('✅ System error audio started playing');
            }).catch(function(e) {
                console.log('❌ System error audio play failed:', e.message);
                
                if (WebAudioHelper.isMobile && State.audioUnlocked && window.AudioContext) {
                    console.log('🔄 Trying WebAudio fallback...');
                    WebAudioHelper.play(
                        State.systemErrorAudio,
                        function() {
                            console.log('✅ System error audio completed via WebAudio');
                        },
                        function(e) {
                            console.log('❌ System error audio WebAudio failed:', e.message);
                        }
                    );
                }
            });
        } else {
            console.log('❌ Audio play promise not supported');
        }
    },

    playHumanWakeupAudio: function() {
        console.log('🔊 Attempting to play human wakeup audio...');
        
        var audio = AudioManager.createAudio(State.humanWakeupAudio);
        audio.volume = Config.settings.audioVolume.effects;
        audio.preload = 'auto';
        
        // Add enhanced fade out effect for background music
        var music = UI.element('backgroundMusic');
        if (music && SG1.musicEnabled && music.volume > 0) {
            var originalVolume = music.volume;
            var fadeSteps = 20;
            var fadeInterval = 100;
            var volumeStep = originalVolume / fadeSteps;
            
            var fadeOut = setInterval(function() {
                if (music.volume > volumeStep) {
                    music.volume = Math.max(0, music.volume - volumeStep);
                } else {
                    music.volume = 0;
                    clearInterval(fadeOut);
                    console.log('🔇 Background music faded out completely');
                }
            }, fadeInterval);
        }
        
        window.audioElements = window.audioElements || [];
        window.audioElements.push(audio);
        
        audio.onloadeddata = function() {
            console.log('✅ Human wakeup audio loaded successfully');
        };
        
        audio.onended = function() {
            console.log('✅ Human wakeup audio completed');
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
                        console.log('🔊 Background music restored');
                    }
                }, restoreInterval);
            }
        };
        
        audio.onerror = function(e) {
            console.log('❌ Human wakeup audio failed:', e);
        };
        
        var playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(function() {
                console.log('✅ Human wakeup audio started playing');
            }).catch(function(e) {
                console.log('❌ Human wakeup audio play failed:', e.message);
                
                if (WebAudioHelper.isMobile && State.audioUnlocked && window.AudioContext) {
                    console.log('🔄 Trying WebAudio fallback for human wakeup...');
                    WebAudioHelper.play(
                        State.humanWakeupAudio,
                        function() {
                            console.log('✅ Human wakeup audio completed via WebAudio');
                        },
                        function(e) {
                            console.log('❌ Human wakeup audio WebAudio failed:', e.message);
                        }
                    );
                }
            });
        } else {
            console.log('❌ Audio play promise not supported for human wakeup');
        }
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

    dissolveAndTransition: function() {
        var dissolveOverlay = UI.element('dissolveOverlay');
        
        if (dissolveOverlay) {
            dissolveOverlay.classList.add('active');
            
            setTimeout(function() {
                Conversation.completeCourse();
            }, 3000);
        } else {
            // Fallback if no dissolve overlay
            setTimeout(function() {
                Conversation.completeCourse();
            }, 1000);
        }
    },

    completeCourse: function() {
        console.log('🎉 Course completed! Attempting Teachable transition...');
        
        setTimeout(function() {
            // Method 1: Look for Teachable completion buttons (most common)
            var buttons = document.querySelectorAll('button, .btn, [role="button"], a[href*="lectures"], .lecture-complete, .next-lecture, .continue-btn');
            
            console.log('🔍 Found', buttons.length, 'potential buttons');
            
            for (var i = 0; i < buttons.length; i++) {
                var btn = buttons[i];
                var text = btn.textContent.toLowerCase().trim();
                var classes = btn.className.toLowerCase();
                var href = btn.href || '';
                
                console.log('🔍 Checking button:', text, '| Classes:', classes, '| Href:', href);
                
                // Check for common Teachable completion patterns
                if (text.indexOf('complete') !== -1 || 
                    text.indexOf('continue') !== -1 || 
                    text.indexOf('next') !== -1 ||
                    text.indexOf('mark complete') !== -1 ||
                    text.indexOf('mark as complete') !== -1 ||
                    classes.indexOf('complete') !== -1 ||
                    classes.indexOf('continue') !== -1 ||
                    classes.indexOf('next') !== -1 ||
                    href.includes('lectures/')) {
                    
                    console.log('✅ Found completion button:', text || classes);
                    btn.click();
                    return;
                }
            }
            
            // Method 2: Look for Teachable-specific completion mechanisms
            console.log('🔄 Method 1 failed, trying Teachable-specific selectors...');
            
            var teachableSelectors = [
                '.lecture-attachment-complete-button',
                '.lecture-complete-button', 
                '.complete-button',
                '.next-lecture-button',
                '.lecture-sidebar .btn',
                '[data-lecture-id] .btn',
                '.lecture-content .btn',
                '.course-player .btn'
            ];
            
            for (var j = 0; j < teachableSelectors.length; j++) {
                var selector = teachableSelectors[j];
                var elements = document.querySelectorAll(selector);
                
                for (var k = 0; k < elements.length; k++) {
                    var element = elements[k];
                    if (element.offsetParent !== null) { // Check if visible
                        console.log('✅ Found Teachable element:', selector);
                        element.click();
                        return;
                    }
                }
            }
            
            // Method 3: Try to trigger Teachable completion programmatically
            console.log('🔄 Method 2 failed, trying programmatic completion...');
            
            try {
                // Trigger common Teachable events
                var completionEvents = ['lecture:complete', 'course:progress', 'teachable:complete'];
                
                completionEvents.forEach(function(eventName) {
                    var event = new CustomEvent(eventName, {
                        detail: { 
                            source: 'SG1', 
                            completed: true,
                            progress: 100 
                        },
                        bubbles: true,
                        cancelable: true
                    });
                    document.dispatchEvent(event);
                    window.dispatchEvent(event);
                });
                
                console.log('✅ Triggered Teachable completion events');
            } catch (e) {
                console.log('❌ Event dispatch failed:', e.message);
            }
            
            // Method 4: Direct URL navigation to next lecture
            console.log('🔄 Method 3 completed, trying URL navigation...');
            
            setTimeout(function() {
                try {
                    var currentUrl = window.location.href;
                    console.log('🔄 Current URL:', currentUrl);
                    
                    if (currentUrl.includes('/lectures/')) {
                        var newUrl = currentUrl.replace(/\/lectures\/(\d+)/, function(match, lectureNum) {
                            var nextNum = parseInt(lectureNum) + 1;
                            console.log('🔄 Navigating to next lecture:', nextNum);
                            return '/lectures/' + nextNum;
                        });
                        
                        if (newUrl !== currentUrl) {
                            console.log('✅ Redirecting to:', newUrl);
                            window.location.href = newUrl;
                            return;
                        }
                    }
                } catch (e) {
                    console.log('❌ Navigation attempt failed:', e.message);
                }
                
                // Method 5: Final fallback - close SG1 overlay
                console.log('🔄 All methods failed, cleaning up SG1...');
                
                try {
                    var sg1Container = document.querySelector('.sg1-container');
                    if (sg1Container) {
                        sg1Container.style.transition = 'opacity 1s ease-out';
                        sg1Container.style.opacity = '0';
                        
                        setTimeout(function() {
                            sg1Container.style.display = 'none';
                            document.body.style.overflow = 'auto';
                            document.documentElement.style.overflow = 'auto';
                            console.log('✅ SG1 container hidden, user can continue manually');
                        }, 1000);
                    }
                } catch (e) {
                    console.log('❌ Cleanup failed:', e.message);
                }
            }, 2000);
            
        }, 1000); // Give dissolve animation time to complete
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