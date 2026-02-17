import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import { giriVisionController } from './giri-vision.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { workspaceMiddleware } from '../../middleware/workspace.middleware.js';

const router = Router();

// Configure multer for video recordings
const recordingStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, '/var/www/productiveapp/recordings');
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `recording-${Date.now()}-${randomUUID()}${ext}`;
    cb(null, uniqueName);
  }
});

const recordingUpload = multer({
  storage: recordingStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max for video recordings
  },
  fileFilter: (_req, file, cb) => {
    // Only accept video files
    const allowedMimes = ['video/webm', 'video/mp4', 'video/x-matroska'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files allowed.'));
    }
  }
});

// All routes require authentication
router.use(authMiddleware);

// =============================================
// THERAPIST PROFILE
// =============================================
router.get('/workspace/:workspaceId/profile', workspaceMiddleware, giriVisionController.getMyProfile.bind(giriVisionController));
router.post('/workspace/:workspaceId/profile', workspaceMiddleware, giriVisionController.createProfile.bind(giriVisionController));
router.put('/profile/:profileId', giriVisionController.updateProfile.bind(giriVisionController));
router.get('/workspace/:workspaceId/therapists', workspaceMiddleware, giriVisionController.listTherapists.bind(giriVisionController));

// =============================================
// DASHBOARD
// =============================================
router.get('/workspace/:workspaceId/dashboard', workspaceMiddleware, giriVisionController.getDashboard.bind(giriVisionController));

// =============================================
// AVAILABILITY
// =============================================
router.put('/workspace/:workspaceId/availability', workspaceMiddleware, giriVisionController.setAvailability.bind(giriVisionController));
router.get('/therapists/:therapistId/availability', giriVisionController.getAvailability.bind(giriVisionController));
router.get('/therapists/:therapistId/slots', giriVisionController.getAvailableSlots.bind(giriVisionController));

// =============================================
// CONSULTATIONS
// =============================================
router.post('/workspace/:workspaceId/consultations', workspaceMiddleware, giriVisionController.createConsultation.bind(giriVisionController));
router.get('/workspace/:workspaceId/consultations', workspaceMiddleware, giriVisionController.listConsultations.bind(giriVisionController));
router.get('/consultations/:consultationId', giriVisionController.getConsultation.bind(giriVisionController));
router.put('/consultations/:consultationId', giriVisionController.updateConsultation.bind(giriVisionController));

// Consultation flow
router.post('/consultations/:consultationId/join', giriVisionController.joinWaitingRoom.bind(giriVisionController));
router.post('/consultations/:consultationId/start', giriVisionController.startConsultation.bind(giriVisionController));
router.post('/consultations/:consultationId/end', giriVisionController.endConsultation.bind(giriVisionController));

// =============================================
// BOOKINGS
// =============================================
router.post('/workspace/:workspaceId/bookings', workspaceMiddleware, giriVisionController.createBooking.bind(giriVisionController));
router.post('/bookings/:bookingId/confirm', giriVisionController.confirmBooking.bind(giriVisionController));
router.post('/bookings/:bookingId/cancel', giriVisionController.cancelBooking.bind(giriVisionController));

// =============================================
// RECORDINGS
// =============================================
router.post('/consultations/:consultationId/recording/start', giriVisionController.startRecording.bind(giriVisionController));
router.post('/consultations/:consultationId/recording/stop', giriVisionController.stopRecording.bind(giriVisionController));
router.get('/consultations/:consultationId/recording', giriVisionController.getRecording.bind(giriVisionController));
router.get('/workspace/:workspaceId/recordings', workspaceMiddleware, giriVisionController.listRecordings.bind(giriVisionController));
router.post('/recordings/upload', recordingUpload.single('recording'), giriVisionController.uploadRecording.bind(giriVisionController));

// =============================================
// REPORTS
// =============================================
router.post('/consultations/:consultationId/report/generate', giriVisionController.generateReport.bind(giriVisionController));
router.get('/consultations/:consultationId/report', giriVisionController.getReport.bind(giriVisionController));
router.put('/reports/:reportId', giriVisionController.updateReport.bind(giriVisionController));

// =============================================
// CLIENT PROGRESS
// =============================================
router.post('/consultations/:consultationId/progress', workspaceMiddleware, giriVisionController.recordProgress.bind(giriVisionController));
router.get('/therapists/:therapistId/clients/:clientId/progress', giriVisionController.getClientProgress.bind(giriVisionController));

export default router;
