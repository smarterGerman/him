// ===== SG1 APPLICATION INITIALIZATION =====

// Global error handling
window.onerror = function(message, source, lineno, colno, error) {
    console.log('ERROR: ' + message + ' at line ' + lineno);
    return false;
};

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        SG1.init();
    });
} else {
    SG1.init();
}

// Debug utilities (available in console)
window.SG1Debug = {
    // Get current state
    state: function() {
        return State.exportState();
    },
    
    // Test audio playback
    testAudio: function(step) {
        step = step || 0;
        var url = State.audioFiles[step];
        if (!url) {
            console.log('No audio for step', step);
            return;
        }
        
    var audio = AudioManager.createAudio(url);
        audio.volume = 0.5;
        audio.play().then(function() {
            console.log('✅ Audio test successful for step', step);
        }).catch(function(e) {
            console.log('❌ Audio test failed for step', step, ':', e.message);
        });
    },
    
    // Skip to specific step
    skipTo: function(step) {
        if (step < 0 || step > 11) {
            console.log('Invalid step. Must be 0-11');
            return;
        }
        
        State.step = step - 1;
        State.isSpeaking = false;
        UI.setVisualizerState('active');
        Conversation.moveToNextQuestion();
    },
    
    // Show all UI elements (for testing)
    showAll: function() {
        DNAButton.showText('Test Button', 'Test Translation');
        DNAButton.showProbabilityChoices();
        console.log('All UI elements should now be visible');
    },
    
    // Hide all UI elements
    hideAll: function() {
        DNAButton.showDNA();
        console.log('All UI elements hidden');
    },
    
    // Force complete course
    complete: function() {
        Conversation.completeCourse();
    },
    
    // Reset to beginning
    reset: function() {
        State.reset();
        UI.setVisualizerState('active');
        Conversation.moveToNextQuestion();
    },
    
    // Toggle music
    toggleMusic: function() {
        SG1.toggleMusic();
    },
    
    // Get configuration
    config: function() {
        return Config;
    },
    
    // Show current mode for debugging
    currentMode: function() {
        return DNAButton.currentMode;
    },
    
    // Force show specific UI
    showUI: function(type) {
        console.log('Forcing show UI:', type);
        switch(type) {
            case 'scale':
                DNAButton.showScaleChoices();
                break;
            case 'mother':
                DNAButton.showMotherDescriptionInput();
                break;
            case 'ai':
                DNAButton.showAIChoices();
                break;
            default:
                console.log('Available UI types: scale, mother, ai');
        }
    }
};

// Initialize platform-specific handlers
if (Config.platform.isMobile) {
    console.log('🚨 Mobile platform detected');
    
    // Mobile-specific initialization
    var MobileHandler = {
        init: function() {
            // Prevent zoom on double-tap
            var lastTouchEnd = 0;
            document.addEventListener('touchend', function(event) {
                var now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                    event.preventDefault();
                }
                lastTouchEnd = now;
            }, false);
            
            // Prevent pull-to-refresh
            document.body.addEventListener('touchstart', function(e) {
                if (e.touches.length === 1 && e.touches[0].clientY === 0) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            document.body.addEventListener('touchmove', function(e) {
    // Check if the touch is on a text input field
    var target = e.target;
    var isTextInput = target && (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' ||
        target.closest('.text-input-container')
    );
    
    // Don't prevent touch events on text inputs
    if (isTextInput) {
        return; // Allow normal text input behavior
    }
    
    // Only prevent pull-to-refresh for other elements
    if (e.touches.length === 1) {
        e.preventDefault();
    }
}, { passive: false });
            
            // Handle viewport changes (keyboard)
            var initialViewportHeight = window.innerHeight;
            
            window.addEventListener('resize', function() {
                var currentHeight = window.innerHeight;
                var heightDifference = initialViewportHeight - currentHeight;
                
                if (heightDifference > 150) {
                    document.body.classList.add('keyboard-open');
                } else {
                    document.body.classList.remove('keyboard-open');
                }
            });
        }
    };
    
    MobileHandler.init();
} else {
    console.log('🖥️ Desktop platform detected');
    
    // Desktop-specific initialization
    var DesktopHandler = {
        init: function() {
            // Keyboard shortcuts
            document.addEventListener('keydown', function(e) {
    // Check if we're currently in a text input field
    var activeElement = document.activeElement;
    var isTextInput = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA'
    );
    
    // Don't intercept keys when user is typing in text fields
    if (isTextInput) {
        return; // Let normal text input behavior continue
    }
    
    // Only apply shortcuts when NOT in text input
    switch(e.key) {
        case ' ': // Spacebar
            e.preventDefault();
            var visibleButton = document.querySelector('.dna-text-button.visible');
            if (visibleButton) visibleButton.click();
            break;
            
        case 'Escape':
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            break;
            
        case 'm':
        case 'M':
            SG1.toggleMusic();
            break;
            
        case 's':
        case 'S':
            Controls.skip();
            break;
    }
});
        }
    };
    
    DesktopHandler.init();
}

// Log platform information for debugging
console.log('=== SG1 PLATFORM INFO ===');
console.log('User Agent:', navigator.userAgent);
console.log('Mobile:', Config.platform.isMobile);
console.log('iOS:', Config.platform.isIOS);
console.log('Android:', Config.platform.isAndroid);
console.log('Safari:', Config.platform.isSafari);
console.log('Chrome:', Config.platform.isChrome);
console.log('Web Audio Support:', Config.platform.supportsWebAudio);
console.log('Audio Context:', !!window.AudioContext || !!window.webkitAudioContext);
console.log('========================');

// Performance monitoring
if (typeof performance !== 'undefined') {
    window.addEventListener('load', function() {
        setTimeout(function() {
            var loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log('Page load time:', loadTime + 'ms');
            
            if (performance.memory) {
                console.log('Memory usage:', Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB');
            }
        }, 1000);
    });
}

// Expose key objects globally for debugging
window.SG1State = State;
window.SG1Config = Config;
window.SG1UI = UI;

console.log('🚀 SG1 Application loaded successfully');
console.log('💡 Use SG1Debug utilities in console for testing');
console.log('💡 Available commands: SG1Debug.state(), SG1Debug.testAudio(0), SG1Debug.skipTo(5)');

// Analytics initialization (if needed)
var Analytics = {
    init: function() {
        // Initialize analytics if needed
        console.log('Analytics initialized');
    },
    
    trackEvent: function(category, action, label) {
        console.log('Analytics event:', category, action, label);
        // Implement analytics tracking here
    }
};

Analytics.init();

var FullscreenToggle = {
    element: null,

    init: function() {
        this.element = document.getElementById('quitButton');
        if (!this.element) {
            return;
        }

        this.boundUpdateState = this.updateState.bind(this);
        this.element.addEventListener('click', this.handleClick.bind(this));

        ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'msfullscreenchange']
            .forEach(function(eventName) {
                document.addEventListener(eventName, FullscreenToggle.boundUpdateState);
            });

        this.updateState();
    },

    isFullscreen: function() {
        return !!(document.fullscreenElement ||
                  document.webkitFullscreenElement ||
                  document.mozFullScreenElement ||
                  document.msFullscreenElement);
    },

    updateState: function() {
        if (!this.element) {
            return;
        }

        if (this.isFullscreen()) {
            this.element.textContent = '×';
            this.element.title = 'Exit fullscreen';
        } else {
            this.element.textContent = '⛶';
            this.element.title = 'Enter fullscreen';
        }
    },

    handleClick: function(event) {
        event.preventDefault();
        event.stopPropagation();

        if (this.isFullscreen()) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        } else {
            var el = document.documentElement;
            if (el.requestFullscreen) {
                el.requestFullscreen().catch(function() {});
            } else if (el.webkitRequestFullscreen) {
                el.webkitRequestFullscreen();
            } else if (el.mozRequestFullScreen) {
                el.mozRequestFullScreen();
            } else if (el.msRequestFullscreen) {
                el.msRequestFullscreen();
            }
        }

        this.updateState();
    }
};

document.addEventListener('DOMContentLoaded', function() {
    FullscreenToggle.init();
});

// ===== SG1 VERIFICATION SCRIPT =====
var SG1Verification = {
    runQuickCheck: function() {
        console.log('🔍 Running SG1 Verification...');
        
        var issues = [];
        var warnings = [];
        
        // Check essential objects exist
        if (typeof Config === 'undefined') {
            issues.push('Config object not loaded');
        }
        
        if (typeof State === 'undefined') {
            issues.push('State object not loaded');
        }
        
        if (typeof UI === 'undefined') {
            issues.push('UI object not loaded');
        }
        
        if (typeof DNAButton === 'undefined') {
            issues.push('DNAButton object not loaded');
        }
        
        if (typeof Conversation === 'undefined') {
            issues.push('Conversation object not loaded');
        }
        
        // Check DOM elements exist
        var requiredElements = ['visualizer', 'progressBar', 'backgroundMusic', 'dnaTextButton', 'statusDisplay'];
        
        requiredElements.forEach(function(id) {
            if (!document.getElementById(id)) {
                issues.push('Missing DOM element: ' + id);
            }
        });
        
        // Check specific conversation elements
        var conversationElements = [
            'whyGermanInputContainer',
            'goalInputContainer', 
            'timeInputContainer',
            'probabilityChoicesContainer',
            'scaleChoicesContainer',
            'motherDescriptionContainer',
            'aiChoicesContainer'
        ];
        
        conversationElements.forEach(function(id) {
            if (!document.getElementById(id)) {
                warnings.push('Missing conversation element: ' + id);
            }
        });
        
        // Report results
        if (issues.length === 0 && warnings.length === 0) {
            console.log('✅ SG1 Verification PASSED - All systems ready!');
            return true;
        } else {
            if (issues.length > 0) {
                console.error('❌ CRITICAL ISSUES:', issues);
            }
            if (warnings.length > 0) {
                console.warn('⚠️ WARNINGS:', warnings);
            }
            return false;
        }
    }
};

// Auto-run verification when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        SG1Verification.runQuickCheck();
    }, 2000);
});

// Add to debug utilities
if (typeof window.SG1Debug !== 'undefined') {
    window.SG1Debug.verify = SG1Verification.runQuickCheck;
}

console.log('🔧 SG1 Verification system loaded');

// ===== DIRECT EXIT BUTTON HANDLER =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        var exitButton = document.getElementById('exitButton');
        if (exitButton) {
            // Remove any existing handlers
            exitButton.onclick = null;
            exitButton.onmousedown = null;
            
            // Add our direct handler
            exitButton.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                console.log('🚨 DIRECT EXIT HANDLER TRIGGERED');
                
                // Immediate audio nuclear option
                handleImmediateExit();
                
                return false;
            }, { capture: true, once: false });
            
            console.log('✅ Direct exit handler installed');
        }
    }, 1000);
});

function handleImmediateExit() {
    console.log('🚨 EXIT HANDLER - Detecting click type');
    
    // Check if we're in fullscreen mode
    var isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
    
    if (isFullscreen) {
        // FIRST CLICK: We're in fullscreen, this will exit fullscreen
        console.log('🔄 FIRST CLICK - Exiting fullscreen, preparing for second click');
        
        // Set a flag for the next click
        window.exitButtonClicked = true;
        
        // Exit fullscreen (browser handles this)
        try {
            if (document.exitFullscreen) document.exitFullscreen();
            if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        } catch (e) {}
        
        // Wait briefly, then show instruction
        setTimeout(function() {
            console.log('💡 Showing click-again instruction');
            var statusDisplay = document.getElementById('statusDisplay');
            var visualizer = document.getElementById('visualizer');
            
            if (statusDisplay) {
                // Add text-mode to fade DNA
                if (visualizer) {
                    visualizer.classList.add('text-mode');
                }
                
                statusDisplay.textContent = 'Click × again to exit';
                statusDisplay.classList.add('visible');
                statusDisplay.style.opacity = '0.8';
                statusDisplay.style.fontSize = '16px';
                
                // Hide instruction after 3 seconds
                setTimeout(function() {
                    statusDisplay.classList.remove('visible');
                    // Remove text-mode to bring DNA back
                    if (visualizer) {
                        visualizer.classList.remove('text-mode');
                    }
                }, 3000);
            }
        }, 500);
        
        return; // Don't proceed with exit logic yet
    }
    
    // SECOND CLICK: We're not in fullscreen, or first click if never was fullscreen
    if (!isFullscreen && window.exitButtonClicked) {
        console.log('🚨 SECOND CLICK - Nuclear audio stop + exit');
    } else {
        console.log('🚨 SINGLE CLICK - Not in fullscreen, direct exit');
    }
    
    // NUCLEAR OPTION - Stop everything immediately
    try {
        // Stop all HTML5 audio
        document.querySelectorAll('audio').forEach(function(audio) {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 0;
            audio.muted = true;
            audio.src = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ4AAAAAAAAAAAAAAAAAAA==';
        });
        
        // Stop WebAudio
        if (window.globalAudioContext) {
            window.globalAudioContext.suspend();
            window.globalAudioContext.close();
        }
        
        // Clear all tracked audio
        if (window.audioElements) {
            window.audioElements.forEach(function(audio) {
                audio.pause();
                audio.src = '';
            });
            window.audioElements = [];
        }
        
        // Block any new audio
        window.audioBlocked = true;
        
        // Kill conversation system
        if (typeof State !== 'undefined') {
            State.isSpeaking = false;
            State.inFinalSequence = true;
            State.audioUnlocked = false;
        }
        
        console.log('✅ NUCLEAR audio stop completed');
        
    } catch (e) {
        console.log('Audio stop error:', e);
    }
    
    // Clear the flag
    window.exitButtonClicked = false;
    
    // Show confirmation dialog
    setTimeout(function() {
        var shouldExit = confirm('Exit the AI assessment?');
        if (shouldExit) {
            window.history.back();
        }
    }, 300);
}