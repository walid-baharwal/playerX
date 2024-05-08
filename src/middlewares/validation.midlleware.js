import { check, validationResult, oneOf } from "express-validator";
import { apiError } from "../utils/apiError.js";

const validateUserRegistration = [
    check("fullName").isLength({ min: 2 }).trim().escape().withMessage("Full name must be at least 2 characters long"),
    check("username")
        .isLength({ min: 5 })
        .trim()
        .escape()
        .matches(/^[a-zA-Z0-9]+$/, "i")
        .withMessage("Username must be at least 5 characters long cannot contain special characters"),
    check("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
    check("password").isLength({ min: 8 }).trim().escape().withMessage("Password must be at least 8 characters long"),
    (req, _, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, "User Registration Validation", errors.array());
        }
        next();
    },
];

// Middleware for login validation
const validateUserLogin = [
    oneOf(
        [
            [
                check("username")
                    .isLength({ min: 5 })
                    .trim()
                    .escape()
                    .matches(/^[a-zA-Z0-9]+$/, "i")
                    .withMessage("Username must be at least 5 characters long cannot contain special characters"),
                check("password")
                    .isLength({ min: 8 })
                    .trim()
                    .escape()
                    .withMessage("Password must be at least 8 characters long"),
            ],
            [
                check("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
                check("password")
                    .isLength({ min: 8 })
                    .trim()
                    .escape()
                    .withMessage("Password must be at least 8 characters long"),
            ],
        ],
        "You must provide either a username or an email along with a password"
    ),

    (req, _, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, "User Login Validation", errors.array());
        }
        next();
    },
];
const validateUserUpdatingDetails = [
    oneOf(
        [
            [
                check("fullName")
                    .isLength({ min: 2 })
                    .trim()
                    .escape()
                    .withMessage("Full name must be at least 2 characters long"),
                check("email").isEmail().withMessage("Invalid email format").normalizeEmail().optional(),
            ],
            [
                check("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
                check("fullName")
                    .isLength({ min: 2 })
                    .trim()
                    .escape()
                    .withMessage("Full name must be at least 2 characters long")
                    .optional(),
            ],
        ],
        "You must provide either a username or an email along with a password"
    ),

    (req, _, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, "User updating details Validation", errors.array());
        }
        next();
    },
];
const validateUpdatePassword = [
    [
        [
            check("oldPassword").trim().escape().optional(),
            check("newPassword")
                .isLength({ min: 8 })
                .trim()
                .escape()
                .withMessage("Password must be at least 8 characters long"),
        ],
    ],

    (req, _, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, "Password Validation", errors.array());
        }
        next();
    },
];
const validateEmail = [
    [[check("email").isEmail().withMessage("Invalid email format").normalizeEmail()]],

    (req, _, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, "Eamil Validation", errors.array());
        }
        next();
    },
];
const validateUsername = [
    [
        [
            check("username")
                .isLength({ min: 5 })
                .trim()
                .escape()
                .matches(/^[a-zA-Z0-9]+$/, "i")
                .withMessage("Username must be at least 5 characters long cannot contain special characters"),
        ],
    ],

    (req, _, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, "Username Validation", errors.array());
        }
        next();
    },
];
const validateContent = [
    [[check("content").isLength({ min: 1 }, { max: 300 }).withMessage("content must be between 1 and 300 characters")]],

    (req, _, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, "Content Validation", errors.array());
        }
        next();
    },
];

export {
    validateUserRegistration,
    validateUserLogin,
    validateUserUpdatingDetails,
    validateUpdatePassword,
    validateEmail,
    validateUsername,
    validateContent,
};
