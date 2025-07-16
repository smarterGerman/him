// ===== SG1 CONFIGURATION =====

var Config = {
    // Audio file mappings for each conversation step
    audioFiles: {
        0: 'https://uploads.teachablecdn.com/attachments/3623b7eb37e640b2946b7f07b730dff7.mp3',  // Welcome
        1: 'https://uploads.teachablecdn.com/attachments/9cc7908384fd49c58242394eadc70273.mp3',  // Why German
        2: 'https://uploads.teachablecdn.com/attachments/fc2c86bf325b410797aa9a99af512c37.mp3',  // Goal
        3: 'https://uploads.teachablecdn.com/attachments/3ac16fa084c24c36aa0dfd5373cdb9e8.mp3',  // Time
        4: 'https://uploads.teachablecdn.com/attachments/95e986d1bd1f427db03b976b4f60f0a7.mp3',  // Probability
        5: 'https://uploads.teachablecdn.com/attachments/64ab0d397cb140dd86458e0b42ea494e.mp3',  // German Love
        6: 'https://uploads.teachablecdn.com/attachments/3241a2f7d8e447469e9d3e038afdbf07.mp3',  // Mother
        7: 'https://uploads.teachablecdn.com/attachments/1c56f997a626423dabf739a56f01b3ee.mp3',  // AI Type (UPDATED)
        8: 'https://uploads.teachablecdn.com/attachments/ac0aa8c556c74c13ba1a451c83baa18d.mp3',  // Processing
        9: 'https://uploads.teachablecdn.com/attachments/16e62c9df320432f92574d0f945c7fe8.mp3',  // Continuation
        10: 'https://uploads.teachablecdn.com/attachments/e380c0630dbd43ec83b27aad05227c4d.mp3', // Analysis
        11: 'https://uploads.teachablecdn.com/attachments/d61b86f90652471181352a77c5dbe7ec.mp3'  // Final
    },
    
    // Special audio files
    specialAudio: {
        thankYou: 'https://uploads.teachablecdn.com/attachments/e45836cb3b024909ae5d8d9d6ae3f22c.mp3',
        confirmation: 'https://uploads.teachablecdn.com/attachments/ebf39ab0ba784db195ca54196bae8784.mp3',
        systemError: 'https://uploads.teachablecdn.com/attachments/595285714e734e99bc63b49e3e70a1e4.mp3',
        humanWakeup: 'https://uploads.teachablecdn.com/attachments/cec6086e76134866a3e151ba70ab4651.mp3',
        backgroundMusic: 'https://uploads.teachablecdn.com/attachments/bf581168d687477abe77c3052ae7782f.mp3',
        // AI Type specific audio (NEW)
        aiTypeMale: 'https://uploads.teachablecdn.com/attachments/e380c0630dbd43ec83b27aad05227c4d.mp3',
        aiTypeFemale: 'https://uploads.teachablecdn.com/attachments/d61b86f90652471181352a77c5dbe7ec.mp3',
        aiTypeDiverse: 'https://uploads.teachablecdn.com/attachments/20c0c1906b8345a48d319c7c08abe0aa.mp3'
    },
    
    // Application settings
    settings: {
        totalSteps: 12,                    // Total number of conversation steps (0-11)
        musicEnabled: true,                // Background music on by default
        debugMode: false,                  // Debug panel visibility
        audioVolume: {
            speech: 1.0,                   // Full volume for speech
            background: 0.3,               // Lower volume for background music
            effects: 0.7                   // Medium volume for sound effects
        },
        timing: {
            buttonDelay: 1500,             // ms to wait before showing UI after audio starts
            responseDelay: 200,            // ms delay for UI responsiveness
            thankYouDelay: 800,            // ms to wait before playing thank you
            nextQuestionDelay: 1000        // ms to wait before moving to next question
        },
        external: {
            unblockCourseUrl: 'https://smartergerman.com/courses/unblock-your-german/'
        }
    },
    
    // Platform detection
    platform: {
        isMobile: /iPhone|iPad|iPod|Android|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
        isAndroid: /Android/i.test(navigator.userAgent),
        isSafari: /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent),
        isChrome: /Chrome/i.test(navigator.userAgent),
        supportsWebAudio: !!(window.AudioContext || window.webkitAudioContext)
    },
    
    // Conversation flow configuration
    conversationFlow: {
        // Define which UI to show for each step
        stepUI: {
            0: 'text',              // "Bereit" button
            1: 'why-german-input',  // Text input for motivation
            2: 'goal-input',        // Text input for goals
            3: 'time-input',        // Text input for time commitment
            4: 'probability',       // Probability choice buttons
            5: 'scale',             // 1-10 scale buttons
            6: 'mother-input',      // Text input for mother relationship
            7: 'ai-choices',        // AI type selection
            8: 'auto',              // Automatic progression
            9: 'auto',              // Automatic progression
            10: 'auto',             // Automatic progression
            11: 'text'              // "Na gut" button
        },
        
        // Define button text and translations
        buttonText: {
            0: { text: 'Bereit', translation: 'Ready' },
            11: { text: 'Na gut', translation: 'Oh well' }
        },
        
        // Define branching logic
        branches: {
            4: {
                'low': 'external_course',    // <50% opens external course
                'medium': 'continue',        // 80% continues normally
                'high': 'continue'           // 100% continues normally
            },
            7: {
                'male': 'male_sequence',     // Triggers male AI installation
                'female': 'female_sequence', // Triggers female AI installation
                'diverse': 'diverse_sequence' // Triggers diverse AI audio (CORRECTED)
            }
        }
    },
    
    // Personality profile templates
    personalityProfiles: [
        {
            title: "Der Überkritische Perfektionist",
            description: "Sie haben höhere Standards als ein Michelin-Inspektor in einem Fastfood-Restaurant. Ihre Erwartungen sind so hoch, dass selbst Ikarus neidisch wäre. Vermutlich korrigieren Sie die Grammatik in Ihren eigenen Träumen.",
            scoreRange: [15, 999]
        },
        {
            title: "Der Enthusiastische Optimist", 
            description: "Sie sehen das Leben durch eine rosarote Brille - die Sie vermutlich selbst rosig gefärbt haben. Ihre Begeisterung ist so ansteckend, dass Motivationstrainer bei Ihnen Nachhilfe nehmen. Sie würden vermutlich auch einem Kaktus beim Wachsen zusehen.",
            scoreRange: [8, 14]
        },
        {
            title: "Der Philosophische Realist",
            description: "Sie haben das Leben durchschaut: Es ist kompliziert, absurd und voller Widersprüche - und genau das macht es interessant. Sie trinken vermutlich Ihren Kaffee schwarz und Ihre Witze trocken. Sarkazmus ist Ihre zweite Muttersprache.",
            scoreRange: [1, 7]
        },
        {
            title: "Der Existenzielle Skeptiker",
            description: "Sie bezweifeln alles - sogar diese Analyse. Ihre Skepsis ist so ausgeprägt, dass Sie vermutlich Ihren eigenen Schatten misstrauen. Sie sind der Grund, warum Philosophen noch einen Job haben.",
            scoreRange: [-999, 0]
        }
    ]
};