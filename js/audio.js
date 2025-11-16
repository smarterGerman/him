// ===== AUDIO MANAGEMENT SYSTEM =====

var AudioManager = {
    // === AUDIO CREATION ===
    createAudio: function(url) {
        var audio = new Audio(url);
        
        // Register for cleanup
        window.audioElements = window.audioElements || [];
        window.audioElements.push(audio);
        
        return audio;
    },
    
    // === BACKGROUND MUSIC ===
    tryStartBackgroundMusic: function() {
        if (!SG1.musicEnabled) return;
        
        var music = UI.element('backgroundMusic');
        if (!music) return;
        
        music.volume = Config.settings.audioVolume.background;
        music.muted = false;
        
        var playPromise = music.play();
        if (playPromise) {
            playPromise.then(function() {
                console.log('✅ Background music started successfully!');
            }).catch(function(e) {
                console.log('❌ Background music prevented: ' + e.name + ' - ' + e.message);
            });
        }
    },
    
    // === STOP ALL AUDIO ===
    stopAllAudio: function() {
        // Stop Web Audio sources
        try {
            if (WebAudioHelper.currentSource) {
                WebAudioHelper.currentSource.stop();
                WebAudioHelper.currentSource = null;
            }
        } catch (e) {
            console.log('WebAudio stop error:', e);
        }
        
        // Stop all HTML5 audio elements (except background music)
        var allAudio = document.querySelectorAll('audio:not(#backgroundMusic)');
        for (var i = 0; i < allAudio.length; i++) {
            try {
                allAudio[i].pause();
                allAudio[i].currentTime = 0;
            } catch (e) {
                console.log('Audio stop error:', e);
            }
        }
        
        // Stop tracked audio elements
        if (window.audioElements) {
            window.audioElements.forEach(function(audio) {
                try {
                    audio.pause();
                    audio.currentTime = 0;
                } catch (e) {}
            });
            window.audioElements = [];
        }
    },

    // === STOP NON-BACKGROUND AUDIO (KEEP BACKGROUND MUSIC PLAYING) ===
    stopNonBackground: function() {
        // Stop Web Audio sources
        try {
            if (WebAudioHelper.currentSource) {
                WebAudioHelper.currentSource.stop();
                WebAudioHelper.currentSource = null;
            }
        } catch (e) {
            console.log('WebAudio stop error:', e);
        }

        // Stop all HTML5 audio elements except background music
        var allAudio = document.querySelectorAll('audio:not(#backgroundMusic)');
        for (var i = 0; i < allAudio.length; i++) {
            try {
                allAudio[i].pause();
                allAudio[i].currentTime = 0;
            } catch (e) {
                console.log('Audio stop error:', e);
            }
        }

        // Stop tracked audio elements (these are created via AudioManager.createAudio)
        if (window.audioElements) {
            window.audioElements.forEach(function(audio) {
                try {
                    // Skip the backgroundMusic element if accidentally tracked
                    if (audio && audio.id === 'backgroundMusic') return;
                    audio.pause();
                    audio.currentTime = 0;
                } catch (e) {}
            });
            // Do not clear window.audioElements entirely - keep background if added there
            window.audioElements = window.audioElements.filter(function(a) { return a && a.id === 'backgroundMusic'; });
        }
    }
};

// === WEB AUDIO HELPER (iOS COMPATIBILITY) ===
var WebAudioHelper = {
    isMobile: Config.platform.isMobile,
    buffers: {},
    currentSource: null,
    
    ensureContext: function() {
        if (!window.globalAudioContext && window.AudioContext) {
            window.globalAudioContext = new AudioContext();
        }
        return window.globalAudioContext;
    },
    
    load: function(url) {
        var self = this;
        var ctx = self.ensureContext();
        if (!ctx) return Promise.reject();
        
        if (self.buffers[url]) {
            return Promise.resolve(self.buffers[url]);
        }
        
        return fetch(url)
            .then(function(r) { return r.arrayBuffer(); })
            .then(function(data) {
                return new Promise(function(resolve, reject) {
                    ctx.decodeAudioData(data, function(buffer) {
                        self.buffers[url] = buffer;
                        resolve(buffer);
                    }, function(e) {
                        reject(e);
                    });
                });
            });
    },
    
    play: function(url, onended, onerror) {
        var self = this;
        self.load(url).then(function(buffer) {
            var ctx = self.ensureContext();
            if (ctx.state === 'suspended') {
                ctx.resume().then(function() {
                    self._playBuffer(ctx, buffer, onended, onerror, url);
                }).catch(function(e) {
                    if (onerror) onerror(e);
                });
            } else {
                self._playBuffer(ctx, buffer, onended, onerror, url);
            }
        }).catch(function(e){
            if (onerror) onerror(e);
        });
    },
    
    _playBuffer: function(ctx, buffer, onended, onerror, url) {
        if (this.currentSource) {
            try { 
                this.currentSource.onended = null; 
                this.currentSource.stop(); 
            } catch(e){}
            this.currentSource = null;
        }
        
        var source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = function() {
            if (onended) onended();
        };
        
        try {
            source.start(0);
        } catch(e) {
            if (onerror) onerror(e);
        }
        
        this.currentSource = source;
    }
};

// === SG1 MAIN AUDIO CONTROLLER ===
var SG1 = {
    musicEnabled: Config.settings.musicEnabled,
    
    toggleMusic: function() {
        var music = UI.element('backgroundMusic');
        var musicButton = UI.element('musicButton');
        
        if (this.musicEnabled) {
            if (music) music.pause();
            if (musicButton) musicButton.classList.add('off');
            this.musicEnabled = false;
        } else {
            if (music) {
                var playPromise = music.play();
                if (playPromise) {
                    playPromise.then(function() {
                        console.log('Music resumed successfully');
                    }).catch(function(e) {
                        console.log('Music resume failed: ' + e.message);
                    });
                }
            }
            if (musicButton) musicButton.classList.remove('off');
            this.musicEnabled = true;
        }
    },
    
    beginInitialization: function() {
        var preInitButton = document.querySelector('.pre-init-button');
        if (preInitButton) {
            preInitButton.style.transform = 'scale(0.95)';
            preInitButton.style.opacity = '0.7';
            preInitButton.textContent = 'Starting...';
        }
        
        // Show control buttons immediately after clicking
        var skipButton = UI.element('skipButton');
        var quitButton = UI.element('quitButton');
        var musicButton = UI.element('musicButton');
        if (skipButton) skipButton.style.display = 'block';
        if (quitButton) quitButton.style.display = 'block';
        if (musicButton) musicButton.style.display = 'block';
        
        var isMobile = Config.platform.isMobile;
        
        // Unlock audio for mobile
        var unlockAudio = AudioManager.createAudio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2+LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiI2OvKcyMFl2+z9N2aPAIbWr9yxmAXGFnj8MJzJQUYYbf2xGIYG1nq6MJzJQUYlGt19Mhvaz5gXFztw2kdA0qP2uzGeTYFG3a36Pn0YlFmdXTs8bHnzLqLh6uYfJBaRoZ1puLsxXEvCSdtytNdKAkzWLz6qHNxMEOw6MtbKhJLkM/d3QBVL9JKR5X2QQAwfOYTM8cVkPB29ppqOZN17+o1GAbSrAXvOK9qVsO2P2bfyXU5aOPYqE+TKYeKc1PEJd+7L2XKHOd6d1qTKZ2pXPHZq36DWdF4VJOhJr6l9YNkFJdFaLyJRjF7X1lGf61O2FO8gY0n');
        unlockAudio.volume = 0.01;
        
        unlockAudio.play().then(function() {
            State.audioUnlocked = true;
            
            try {
                if (!window.globalAudioContext && window.AudioContext) {
                    window.globalAudioContext = new AudioContext();
                }
                if (window.globalAudioContext && window.globalAudioContext.state === 'suspended') {
                    window.globalAudioContext.resume();
                }
            } catch (e) {}
        }).catch(function(e) {
            State.audioUnlocked = false;
        });
        
        // Start background music
        var music = UI.element('backgroundMusic');
        if (music && SG1.musicEnabled) {
            music.volume = Config.settings.audioVolume.background;
            music.play().catch(function(e) {
                console.log('❌ Background music failed: ' + e.message);
            });
        }
        
        // Mobile audio context initialization
        if (isMobile) {
            try {
                var ctx = window.globalAudioContext || (window.AudioContext ? new AudioContext() : null);
                if (ctx) {
                    var buffer = ctx.createBuffer(1, 1, 22050);
                    var source = ctx.createBufferSource();
                    source.buffer = buffer;
                    source.connect(ctx.destination);
                    source.start(0);
                }
            } catch (e) {}
        }
        
        setTimeout(function() {
            // Request fullscreen
            try {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(function(e) {});
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                }
            } catch (e) {}
            
            UI.hideElement('preInitOverlay');
            UI.showElement('initOverlay');
            
            SG1.startInitialization();
        }, 300);
    },

    startInitialization: function() {
        var logo = document.querySelector('.init-logo');
        var status = UI.element('statusText');
        
        // Mark that we're initializing
        State.isInitializing = true;
        
        if (status) status.textContent = 'Audio system ready. Loading voice...';
        
        if (logo) {
            logo.style.opacity = '0';
            logo.style.animation = 'none';
            logo.style.transform = 'translate(-50%, -50%) scale(0.8)';
            
            var timer1 = setTimeout(function() {
                if (!State.isInitializing) return; // Skip if no longer initializing
                
                if (status) {
                    status.textContent = 'Voice system online. Starting sequence...';
                    var timer2 = setTimeout(function() {
                        if (!State.isInitializing) return;
                        status.style.transition = 'opacity 1s ease-out';
                        status.style.opacity = '0';
                    }, 2000);
                    State.addInitTimer(timer2);
                }
                
                logo.style.animation = 'sg1LogoFade 16s ease-in-out forwards';
                
                var timer3 = setTimeout(function() {
                    if (!State.isInitializing) return;
                    if (logo.style.opacity === '0') {
                        logo.style.opacity = '1';
                        logo.style.transform = 'translate(-50%, -50%) scale(1)';
                        
                        var timer4 = setTimeout(function() {
                            if (!State.isInitializing) return;
                            logo.style.opacity = '0';
                        }, 10000);
                        State.addInitTimer(timer4);
                    }
                }, 3000);
                State.addInitTimer(timer3);
                
            }, 1000);
            State.addInitTimer(timer1);
        }
        
        var timer5 = setTimeout(function() {
            if (!State.isInitializing) return;
            if (status) status.textContent = 'Loading neural interface...';
            
            var timer6 = setTimeout(function() {
                if (!State.isInitializing) return;
                UI.showElement('visualizer');
                
                var visualizer = UI.element('visualizer');
                if (visualizer) {
                    visualizer.style.opacity = '0';
                    visualizer.style.transition = 'opacity 4s ease-in';
                    var timer7 = setTimeout(function() {
                        if (!State.isInitializing) return;
                        visualizer.style.opacity = '1';
                    }, 100);
                    State.addInitTimer(timer7);
                }
                
                // Handle mobile audio initialization
                var isMobile = Config.platform.isMobile;
                if (isMobile && !State.mobileAudioStarted) {
                    var timer8 = setTimeout(function() {
                        if (!State.isInitializing) return;
                        var mobileVoiceAudio = AudioManager.createAudio(State.audioFiles[0]);
                        mobileVoiceAudio.volume = Config.settings.audioVolume.speech;
                        
                        var playPromise = mobileVoiceAudio.play();
                        if (playPromise) {
                            playPromise.then(function() {
                                State.isSpeaking = true;
                                State.step = 0;
                                State.mobileAudioStarted = true;
                                UI.setVisualizerState('speaking');
                                
                                mobileVoiceAudio.onended = function() {
                                    State.isSpeaking = false;
                                    UI.setVisualizerState('active');
                                    var timer9 = setTimeout(function() { 
                                        if (!State.isInitializing) return;
                                        DNAButton.showText('Bereit', 'Ready'); 
                                    }, 1000);
                                    State.addInitTimer(timer9);
                                };
                            }).catch(function(e) {});
                        }
                    }, 4100);
                    State.addInitTimer(timer8);
                }
            }, 1000);
            State.addInitTimer(timer6);
        }, 15000);
        State.addInitTimer(timer5);

        var timer10 = setTimeout(function() {
            if (!State.isInitializing) return;
            if (status) status.textContent = 'Ready to begin...';
            UI.hideElement('initOverlay');
            
            var timer11 = setTimeout(function() {
                if (!State.isInitializing) return;
                State.isInitializing = false; // Mark initialization as complete
                Conversation.startQ1();
            }, 500);
            State.addInitTimer(timer11);
        }, 18000);
        State.addInitTimer(timer10);
    },

    init: function() {
        console.log('SG1 initialized');
        State.updateProgress();
    }
};