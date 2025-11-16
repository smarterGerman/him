// ===== SG1 CONFIGURATION - SIMPLE VERSION =====

var Config = {
    // Audio file mappings for each conversation step
    audioFiles: {
        0: 'https://uploads.teachablecdn.com/attachments/3623b7eb37e640b2946b7f07b730dff7.mp3',  // Welcome
        1: 'https://uploads.teachablecdn.com/attachments/9cc7908384fd49c58242394eadc70273.mp3',  // Why German
        2: 'https://uploads.teachablecdn.com/attachments/fc2c86bf325b410797aa9a99af512c37.mp3',  // Goal
        3: 'https://uploads.teachablecdn.com/attachments/3ac16fa084c24c36aa0dfd5373cdb9e8.mp3',  // Time
        4: 'https://uploads.teachablecdn.com/attachments/95e986d1bd1f427db03b976b4f60f0a7.mp3',  // Probability
        5: 'https://uploads.teachablecdn.com/attachments/64ab0d397cb140dd86458e0b42ea494e.mp3',  // German Love
        6: 'https://uploads.teachablecdn.com/attachments/ac0aa8c556c74c13ba1a451c83baa18d.mp3',  // Mother
        7: 'https://uploads.teachablecdn.com/attachments/1c56f997a626423dabf739a56f01b3ee.mp3',  // AI Type
        8: 'https://uploads.teachablecdn.com/attachments/e380c0630dbd43ec83b27aad05227c4d.mp3',  // AI Type Male
    9: 'https://uploads.teachablecdn.com/attachments/a8e2d86a6ceb463fb3cf3b03bedb1655.mp3',  // AI Type Female  
    10: 'https://uploads.teachablecdn.com/attachments/b93a557ec98d4047ae9d3dcc528274ce.mp3', // Analysis/Diverse
    11: 'https://uploads.teachablecdn.com/attachments/55327ee5fd3642c68ea3a007ce515bae.mp3'  // Final
    },
    
    // Special audio files
    specialAudio: {
        thankYou: 'https://uploads.teachablecdn.com/attachments/e45836cb3b024909ae5d8d9d6ae3f22c.mp3',
        confirmation: 'https://uploads.teachablecdn.com/attachments/ebf39ab0ba784db195ca54196bae8784.mp3',
        systemError: 'https://uploads.teachablecdn.com/attachments/595285714e734e99bc63b49e3e70a1e4.mp3',
        humanWakeup: 'https://uploads.teachablecdn.com/attachments/cec6086e76134866a3e151ba70ab4651.mp3',
        backgroundMusic: 'https://uploads.teachablecdn.com/attachments/bf581168d687477abe77c3052ae7782f.mp3',
        analysingInput: 'https://uploads.teachablecdn.com/attachments/45396480d7f748f29608c56ac2e11ad7.mp3'
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
            nextQuestionDelay: 1000,       // ms to wait before moving to next question
            finalSequenceDelay: 7000       // 7 seconds before final sequence
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
            8: 'auto',              // AI sequence (male/female/diverse)
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
                'male': 'male_sequence',     // Triggers male AI installation (file 8)
                'female': 'female_sequence', // Triggers female AI installation (file 9)
                'diverse': 'diverse_sequence' // Triggers diverse AI audio (file 10)
            }
        }
    },
    
    // Personality profile templates
    personalityProfiles: [
        {
            title: "The Hypercritical Perfectionist",
            description: "You have higher standards than a Michelin inspector in a fast-food restaurant. Your expectations are so high that even Icarus would be envious. You probably correct grammar in your own dreams.",
            scoreRange: [15, 999],
            variants: [
                {
                    title: "The Hypercritical Perfectionist",
                    description: "You have higher standards than a Michelin inspector in a fast-food restaurant. Your expectations are so high that even Icarus would be envious. You probably correct grammar in your own dreams."
                },
                {
                    title: "The Relentless Standards-Bearer",
                    description: "Your standards are so exacting that Swiss watchmakers seek your approval. You're the person who finds typos in professional publications and sighs audibly at misplaced apostrophes. Perfectionism isn't just a trait for you—it's a lifestyle."
                },
                {
                    title: "The Uncompromising Excellence Seeker",
                    description: "You operate on a level of precision that makes NASA engineers look casual. Your attention to detail is so acute that you notice when pixels are slightly misaligned. Quality isn't negotiable—it's the bare minimum."
                }
            ]
        },
        {
            title: "The Enthusiastic Optimist",
            description: "You see life through rose-colored glasses—which you probably tinted yourself. Your enthusiasm is so contagious that motivational speakers take lessons from you. You would probably watch a cactus grow with genuine interest.",
            scoreRange: [8, 14],
            variants: [
                {
                    title: "The Enthusiastic Optimist",
                    description: "You see life through rose-colored glasses—which you probably tinted yourself. Your enthusiasm is so contagious that motivational speakers take lessons from you. You would probably watch a cactus grow with genuine interest."
                },
                {
                    title: "The Unstoppable Positivity Engine",
                    description: "Your optimism radiates with the intensity of a small sun. You're the person who finds silver linings in storm clouds and somehow makes waiting in line feel like an adventure. Energy drinks probably study your formula."
                },
                {
                    title: "The Infectious Joy Spreader",
                    description: "You approach life like it's a perpetual celebration waiting to happen. Your enthusiasm could power a small city, and your positive attitude makes even Monday mornings seem promising. You're basically sunshine in human form."
                }
            ]
        },
        {
            title: "The Philosophical Realist",
            description: "You've figured out life: it's complicated, absurd, and full of contradictions—and that's exactly what makes it interesting. You probably drink your coffee black and your humor dry. Sarcasm is your second language.",
            scoreRange: [1, 7],
            variants: [
                {
                    title: "The Philosophical Realist",
                    description: "You've figured out life: it's complicated, absurd, and full of contradictions—and that's exactly what makes it interesting. You probably drink your coffee black and your humor dry. Sarcasm is your second language."
                },
                {
                    title: "The Pragmatic Truth-Teller",
                    description: "You navigate life with the wisdom of someone who's seen enough to know better, but not so much that you've lost hope. Your worldview is seasoned with experience and a healthy dose of 'let's see how this plays out.' You're the friend people come to for honest advice."
                },
                {
                    title: "The Balanced Skeptic",
                    description: "You approach life with measured expectations and a well-calibrated bullshit detector. You're neither cynical nor naive—just comfortably positioned in that sweet spot of realistic optimism. You're the person who reads the fine print and actually understands it."
                }
            ]
        },
        {
            title: "The Existential Skeptic",
            description: "You doubt everything—even this analysis. Your skepticism is so pronounced that you probably distrust your own shadow. You're the reason philosophers still have jobs.",
            scoreRange: [-999, 0],
            variants: [
                {
                    title: "The Existential Skeptic",
                    description: "You doubt everything—even this analysis. Your skepticism is so pronounced that you probably distrust your own shadow. You're the reason philosophers still have jobs."
                },
                {
                    title: "The Professional Questioner",
                    description: "You approach life like a detective investigating a particularly confusing case where all the evidence contradicts itself. Your default mode is 'hmm, but what if...' and you've turned doubt into an art form. Certainty makes you suspicious."
                },
                {
                    title: "The Methodical Doubter",
                    description: "You've made skepticism into a refined science. You question questions, doubt doubts, and approach certainty with the wariness of someone who's been burned by overconfidence before. Your motto might as well be 'trust, but verify everything twice.'"
                }
            ]
        }
    ]
};