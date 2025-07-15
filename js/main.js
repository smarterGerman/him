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
        
        var audio = new Audio(url);
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
        DNAButton.showAnswerChoices();
        DNAButton.showTimeInput();
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