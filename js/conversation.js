// ===== CONVERSATION FLOW & UI LOGIC =====

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
            State.saveResponse('whyGerman', whyValue); // CONSISTENT METHOD
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
            State.saveResponse('timeCommitment', hours); // CONSISTENT METHOD
            State.saveResponse('timeText', timeValue); // CONSISTENT METHOD
            this.submitToGoogleForm(timeValue, 'time_commitment');
            
            // Add score based on time commitment
            if (hours >= 15) State.addScore(5); // CONSISTENT METHOD
            else if (hours >= 5) State.addScore(3); // CONSISTENT METHOD
            else State.addScore(1); // CONSISTENT METHOD
        }
        
        this.animateInputContainerOut('timeInputContainer');
        
        setTimeout(function() {
            DNAButton.showDNA();
            Conversation.playThankYou();
        }, 800);
    },

    handleProbabilityChoice: function(level) {
        if (this.currentMode !== 'probability') return;
        
        State.saveResponse('goalLikelihood', level); // CONSISTENT METHOD
        
        // Add score based on confidence level
        var scoreMap = { 'low': -1, 'medium': 2, 'high': 4 };
        State.addScore(scoreMap[level] || 0); // CONSISTENT METHOD
        
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
            State.saveResponse('germanLove', rating); // CONSISTENT METHOD
            State.addScore(Math.max(0, rating - 5)); // CONSISTENT METHOD
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
        
        State.saveResponse('aiChoice', aiType); // CONSISTENT METHOD
        
        // Add score based on AI type choice
        var scoreMap = { 'diverse': 3, 'female': 2, 'male': 1 };
        State.addScore(scoreMap[aiType] || 0); // CONSISTENT METHOD
        
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

    // === PERSONALITY PROFILE GENERATION ===
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
                return {
                    title: profile.title,
                    description: profile.description + '\n\nIhr Deutschziel erreichen Sie in etwa ' + timeString + ' (' + totalHours + ' Stunden).'
                };
            }
        }
        
        return profiles[2]; // Default to realist
    },

    formatTimeEstimate: function(weeks) {
        var years = Math.floor(weeks / 52);
        var months = Math.floor((weeks % 52) / 4.33);
        
        if (years > 0) {
            return years + (years === 1 ? ' Jahr' : ' Jahre');
        } else if (months > 0) {
            return months + (months === 1 ? ' Monat' : ' Monate');
        } else {
            return weeks + (weeks === 1 ? ' Woche' : ' Wochen');
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
            return true;
        }
        return false;
    }
};

// ===== CONVERSATION CONTROLLER =====
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
        // USE CONSISTENT STATE METHOD
        State.nextStep(); // This handles both step increment and progress update
        console.log('🔄 Moving to step:', State.step);
        
        // Handle AI sequence branching
        if (State.step === 8 && State.selectedAIType === 'male') {
            this.startMaleAISequence();
            return;
        } else if (State.step === 8 && State.selectedAIType === 'female') {
            this.startFemaleAISequence();
            return;
        } else if (State.step === 8 && State.selectedAIType === 'diverse') {
            this.startDiverseAISequence();
            return;
        }
        
        if (State.isComplete()) {
            this.completeCourse();
            return;
        }
        
        State.isSpeaking = true;
        UI.setVisualizerState('speaking');
        
        var audioUrl = State.audioFiles[State.step];
        console.log('🔊 Playing audio for step:', State.step, audioUrl);
        
        if (WebAudioHelper.isMobile && State.audioUnlocked && window.AudioContext) {
            WebAudioHelper.play(
                audioUrl,
                function() {
                    State.isSpeaking = false;
                    UI.setVisualizerState('active');
                    Conversation.showNextButton();
                },
                function(e) {
                    State.isSpeaking = false;
                    UI.setVisualizerState('active');
                    Conversation.showNextButton();
                }
            );
        } else {
            var audio = AudioManager.createAudio(audioUrl);
            audio.onended = function() {
                State.isSpeaking = false;
                UI.setVisualizerState('active');
                Conversation.showNextButton();
            };
            audio.onerror = function(e) {
                State.isSpeaking = false;
                UI.setVisualizerState('active');
                Conversation.showNextButton();
            };
            audio.play().catch(function(e) {
                State.isSpeaking = false;
                UI.setVisualizerState('active');
                Conversation.showNextButton();
            });
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

    // === AI SEQUENCE HANDLERS ===
    startMaleAISequence: function() {
        this.playAISequenceAudio(State.aiTypeMaleAudio, 'male');
    },

    startFemaleAISequence: function() {
        this.playAISequenceAudio(State.aiTypeFemaleAudio, 'female');
    },

    startDiverseAISequence: function() {
        this.playAISequenceAudio(State.aiTypeDiverseAudio, 'diverse');
    },

    // === UNIFIED AI SEQUENCE AUDIO HANDLER ===
    playAISequenceAudio: function(audioUrl, aiType) {
        var self = this;
        
        State.isSpeaking = true;
        UI.setVisualizerState('speaking');
        
        console.log('🔊 Playing', aiType, 'AI audio:', audioUrl);
        
        var onComplete = function() {
            State.isSpeaking = false;
            UI.setVisualizerState('active');
            setTimeout(function() {
                State.step = 10; // Move to step 11 (analysis)
                self.moveToNextQuestion();
            }, 1000);
        };

        var onError = function(e) {
            console.warn('AI sequence audio error:', e);
            State.isSpeaking = false;
            UI.setVisualizerState('active');
            setTimeout(function() {
                State.step = 10;
                self.moveToNextQuestion();
            }, 1000);
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

    startFinalSequence: function() {
        console.log('Starting final sequence');
        
        setTimeout(function() {
            Conversation.dissolveAndTransition();
        }, 5000);
    },

    dissolveAndTransition: function() {
        var dissolveOverlay = UI.element('dissolveOverlay');
        
        if (dissolveOverlay) {
            dissolveOverlay.classList.add('active');
            
            setTimeout(function() {
                Conversation.completeCourse();
            }, 3000);
        }
    },

    completeCourse: function() {
        console.log('Course completed!');
        // Handle course completion - could redirect or trigger external completion
    },

    startQ1: function() {
        var isMobile = Config.platform.isMobile;
        if (isMobile && State.mobileAudioStarted) return;
        
        UI.setVisualizerState('active');
        State.updateProgress(); // Use consistent method
        State.step = 0;
        
        var url = State.audioFiles[0];
        UI.setVisualizerState('speaking');
        
        if (window.AudioContext && WebAudioHelper) {
            WebAudioHelper.play(url, function() {
                UI.setVisualizerState('active');
                setTimeout(function() { 
                    DNAButton.showText('Bereit', 'Ready'); 
                }, 2000);
            }, function(e) {
                UI.setVisualizerState('active');
                setTimeout(function() { 
                    DNAButton.showText('Bereit', 'Ready'); 
                }, 2000);
            });
        } else {
            var audio = AudioManager.createAudio(url);
            audio.onended = function() {
                UI.setVisualizerState('active');
                setTimeout(function() { DNAButton.showText('Bereit', 'Ready'); }, 2000);
            };
            audio.onerror = function(e) {
                UI.setVisualizerState('active');
                setTimeout(function() { DNAButton.showText('Bereit', 'Ready'); }, 2000);
            };
            audio.play();
        }
    }
};