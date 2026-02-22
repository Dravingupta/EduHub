/**
 * Application-wide constants.
 * Centralizes magic numbers for maintainability.
 */

export const EXPECTED_TIME_PER_QUESTION = 45; // seconds

export const WEAK_TOPIC_THRESHOLD = 60;
export const STRONG_TOPIC_THRESHOLD = 80;

export const INACTIVITY_HOURS = 48;

export const MAX_SWAPS_PER_TOPIC = 3;

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 1000;

export const CACHE_TTL_DEFAULT = 300; // 5 minutes in seconds

export const READINESS_WARNING_THRESHOLD = 50;
export const WEAK_TOPIC_ALERT_THRESHOLD = 3;

export const SLOW_REQUEST_THRESHOLD_MS = 1000;

export const REQUIRED_ENV_VARS = [
    'PORT',
    'MONGODB_URL',
    'FIREBASE_PROJECT_ID',
];

export const UNIVERSAL_SUBJECTS = {
    "Physics_JEE": [
        "Kinematics",
        "Laws of Motion",
        "Magnetism"
    ],
    "Chemistry_JEE": [
        "Atomic Structure",
        "Thermodynamics"
    ],
    "Mathematics_JEE": [
        "Calculus",
        "Algebra",
        "Coordinate Geometry"
    ],
    "Physics_NEET": [
        "Kinematics",
        "Laws of Motion",
        "Optics"
    ],
    "Chemistry_NEET": [
        "Atomic Structure",
        "Thermodynamics"
    ],
    "Biology_NEET": [
        "Human Physiology",
        "Genetics",
        "Cell Structure"
    ]
};
