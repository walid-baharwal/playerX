 import {check , validationResult, oneOf} from "express-validator"


 const validateUserRegistration = [
    check('fullName').isLength({ min: 2 }).trim().escape().withMessage('Full name must be at least 2 characters long'),
    check('username').isLength({ min: 5 }).trim().escape().withMessage('Username must be at least 5 characters long'),
    check('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
    check('password').isLength({ min: 6 }).trim().escape().withMessage('Password must be at least 6 characters long'),
    (req, _, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, "", errors.array());
        }
        next();
    }
];

// Middleware for login validation
const validateUserLogin = [
    oneOf([
        [
            check('username').isLength({ min: 5 }).trim().escape().withMessage('Username must be at least 5 characters long'),
            check('password').isLength({ min: 6 }).trim().escape().withMessage('Password must be at least 6 characters long'),
        ],
        [
            check('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
            check('password').isLength({ min: 6 }).trim().escape().withMessage('Password must be at least 6 characters long'),
        ]
    ], 'You must provide either a username or an email along with a password'),

    (req, _, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, "", errors.array());
        }
        next();
    }
];
const validateUserUpdatingDetails = [
    oneOf([
        [
            check('fullName').isLength({ min: 2 }).trim().escape().withMessage('Full name must be at least 2 characters long'),
            check('email').isEmail().withMessage('Invalid email format').normalizeEmail().optional(),
        ],
        [
            check('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
            check('fullName').isLength({ min: 2 }).trim().escape().withMessage('Full name must be at least 2 characters long').optional(),
        ]
    ], 'You must provide either a username or an email along with a password'),

    (req, _, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, "", errors.array());
        }
        next();
    }
];
const validateResetPasswordoperation = [
    oneOf([
        [
            check('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
        ],
        [
            check('password').isLength({ min: 6 }).trim().escape().withMessage('Password must be at least 6 characters long'),
        ]
    ], 'You must provide either a username or an email along with a password'),

    (req, _, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, "", errors.array());
        }
        next();
    }
];

export {
    validateUserRegistration,
    validateUserLogin,
    validateUserUpdatingDetails,
    validateResetPasswordoperation
}