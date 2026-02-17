"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const helpers_js_1 = require("../../utils/helpers.js");
const router = (0, express_1.Router)();
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path_1.default.join(process.cwd(), 'uploads'));
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const uniqueName = `${Date.now()}-${(0, crypto_1.randomUUID)()}${ext}`;
        cb(null, uniqueName);
    }
});
// File filter
const fileFilter = (_req, file, cb) => {
    // Allow common file types
    const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'application/zip',
        'application/x-rar-compressed',
        'audio/mpeg',
        'video/mp4'
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter
});
// All routes require authentication
router.use(auth_middleware_js_1.authMiddleware);
// Upload file for messaging
router.post('/message', upload.single('file'), (req, res, next) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({
                success: false,
                error: { code: 'NO_FILE', message: 'No file uploaded' }
            });
            return;
        }
        const fileUrl = `/uploads/${file.filename}`;
        res.status(201).json((0, helpers_js_1.successResponse)({
            url: fileUrl,
            filename: file.originalname,
            size: file.size,
            mimetype: file.mimetype
        }));
    }
    catch (error) {
        next(error);
    }
});
// Upload multiple files
router.post('/multiple', upload.array('files', 10), (req, res, next) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            res.status(400).json({
                success: false,
                error: { code: 'NO_FILES', message: 'No files uploaded' }
            });
            return;
        }
        const uploadedFiles = files.map(file => ({
            url: `/uploads/${file.filename}`,
            filename: file.originalname,
            size: file.size,
            mimetype: file.mimetype
        }));
        res.status(201).json((0, helpers_js_1.successResponse)({ files: uploadedFiles }));
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=uploads.routes.js.map