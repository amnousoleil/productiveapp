import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { giriVisionService } from './giri-vision.service.js';
import { successResponse, AppError } from '../../utils/helpers.js';
import { uuidSchema } from '../../utils/validation.js';
import { z } from 'zod';

// =============================================
// VALIDATION SCHEMAS
// =============================================

const createProfileSchema = z.object({
  specialties: z.array(z.string()).optional(),
  bio: z.string().max(2000).optional(),
  experience_years: z.number().int().min(0).optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  hourly_rate: z.number().min(0).optional(),
  session_duration_minutes: z.number().int().min(15).max(180).optional(),
  auto_record: z.boolean().optional(),
  waiting_room_enabled: z.boolean().optional(),
  max_daily_sessions: z.number().int().min(1).max(20).optional(),
  buffer_minutes: z.number().int().min(0).max(60).optional(),
});

const updateProfileSchema = createProfileSchema.extend({
  availability_status: z.enum(['available', 'busy', 'offline']).optional(),
});

const availabilitySlotsSchema = z.object({
  slots: z.array(z.object({
    day_of_week: z.number().int().min(0).max(6),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
  })),
});

const createBookingSchema = z.object({
  therapist_id: uuidSchema,
  requested_at: z.string().datetime(),
  client_message: z.string().max(1000).optional(),
});

const createConsultationSchema = z.object({
  therapist_id: uuidSchema,
  client_user_id: uuidSchema,
  scheduled_at: z.string().datetime(),
  duration_minutes: z.number().int().min(15).max(180).optional(),
  amount: z.number().min(0).optional(),
});

const updateConsultationSchema = z.object({
  status: z.enum(['scheduled', 'waiting', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
  therapist_notes: z.string().max(10000).optional(),
  therapist_private_notes: z.string().max(10000).optional(),
  client_rating: z.number().int().min(1).max(5).optional(),
  client_feedback: z.string().max(2000).optional(),
});

const confirmBookingSchema = z.object({
  response: z.string().max(1000).optional(),
});

const updateReportSchema = z.object({
  status: z.enum(['reviewed', 'published', 'archived']).optional(),
  client_summary: z.string().max(5000).optional(),
  client_recommendations: z.array(z.string()).optional(),
  client_exercises: z.array(z.any()).optional(),
  progress_notes: z.string().max(5000).optional(),
  next_session_focus: z.string().max(1000).optional(),
});

const progressSchema = z.object({
  wellbeing_score: z.number().int().min(1).max(10).optional(),
  anxiety_level: z.number().int().min(1).max(10).optional(),
  mood_score: z.number().int().min(1).max(10).optional(),
});

// =============================================
// CONTROLLER
// =============================================

export class GiriVisionController {

  // --- PROFILE ---

  async getMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;
      const profile = await giriVisionService.getProfile(userId, workspaceId);
      res.json(successResponse({ profile }));
    } catch (error) { next(error); }
  }

  async createProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;
      const input = createProfileSchema.parse(req.body);

      // Check if profile already exists
      const existingProfile = await giriVisionService.getProfile(userId, workspaceId);
      if (existingProfile) {
        // Update existing profile instead of creating a duplicate
        const updatedProfile = await giriVisionService.updateProfile(existingProfile.id, input);
        res.json(successResponse({ profile: updatedProfile }));
        return;
      }

      const profile = await giriVisionService.createProfile(userId, workspaceId, input);
      res.status(201).json(successResponse({ profile }));
    } catch (error) { next(error); }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profileId = uuidSchema.parse(req.params.profileId);
      const input = updateProfileSchema.parse(req.body);
      const profile = await giriVisionService.updateProfile(profileId, input);
      res.json(successResponse({ profile }));
    } catch (error) { next(error); }
  }

  async listTherapists(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const therapists = await giriVisionService.listTherapists(workspaceId);
      res.json(successResponse({ therapists }));
    } catch (error) { next(error); }
  }

  // --- DASHBOARD ---

  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;
      const dashboard = await giriVisionService.getTherapistDashboard(userId, workspaceId);
      res.json(successResponse({ dashboard }));
    } catch (error) { next(error); }
  }

  // --- AVAILABILITY ---

  async setAvailability(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;
      const { slots } = availabilitySlotsSchema.parse(req.body);
      const profile = await giriVisionService.getProfile(userId, workspaceId);
      if (!profile) throw AppError.notFound('Therapist profile');
      const result = await giriVisionService.setAvailabilitySlots(profile.id, slots);
      res.json(successResponse({ slots: result }));
    } catch (error) { next(error); }
  }

  async getAvailability(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const therapistId = uuidSchema.parse(req.params.therapistId);
      const slots = await giriVisionService.getAvailabilitySlots(therapistId);
      res.json(successResponse({ slots }));
    } catch (error) { next(error); }
  }

  async getAvailableSlots(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const therapistId = uuidSchema.parse(req.params.therapistId);
      const date = z.string().parse(req.query.date);
      const slots = await giriVisionService.getAvailableSlots(therapistId, date);
      res.json(successResponse({ slots }));
    } catch (error) { next(error); }
  }

  // --- CONSULTATIONS ---

  async createConsultation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const input = createConsultationSchema.parse(req.body);
      const consultation = await giriVisionService.createConsultation(workspaceId, input);
      res.status(201).json(successResponse({ consultation }));
    } catch (error) { next(error); }
  }

  async getConsultation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const consultationId = uuidSchema.parse(req.params.consultationId);
      const consultation = await giriVisionService.getConsultation(consultationId);
      res.json(successResponse({ consultation }));
    } catch (error) { next(error); }
  }

  async listConsultations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const consultations = await giriVisionService.listConsultations(workspaceId, userId, {});
      res.json(successResponse({ consultations }));
    } catch (error) { next(error); }
  }

  async updateConsultation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const consultationId = uuidSchema.parse(req.params.consultationId);
      const input = updateConsultationSchema.parse(req.body);
      const consultation = await giriVisionService.updateConsultation(consultationId, input);
      res.json(successResponse({ consultation }));
    } catch (error) { next(error); }
  }

  async joinWaitingRoom(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const consultationId = uuidSchema.parse(req.params.consultationId);
      const userId = req.user!.id;
      const consultation = await giriVisionService.joinWaitingRoom(consultationId, userId);
      res.json(successResponse({ consultation }));
    } catch (error) { next(error); }
  }

  async startConsultation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const consultationId = uuidSchema.parse(req.params.consultationId);
      const userId = req.user!.id;
      const consultation = await giriVisionService.startConsultation(consultationId, userId);
      res.json(successResponse({ consultation }));
    } catch (error) { next(error); }
  }

  async endConsultation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const consultationId = uuidSchema.parse(req.params.consultationId);
      const userId = req.user!.id;
      const consultation = await giriVisionService.endConsultation(consultationId, userId);
      res.json(successResponse({ consultation }));
    } catch (error) { next(error); }
  }

  // --- BOOKINGS ---

  async createBooking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const input = createBookingSchema.parse(req.body);
      const booking = await giriVisionService.createBooking(workspaceId, userId, input);
      res.status(201).json(successResponse({ booking }));
    } catch (error) { next(error); }
  }

  async confirmBooking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingId = uuidSchema.parse(req.params.bookingId);
      const userId = req.user!.id;
      const { response } = confirmBookingSchema.parse(req.body);
      const result = await giriVisionService.confirmBooking(bookingId, userId, response);
      res.json(successResponse(result));
    } catch (error) { next(error); }
  }

  async cancelBooking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingId = uuidSchema.parse(req.params.bookingId);
      const userId = req.user!.id;
      const booking = await giriVisionService.cancelBooking(bookingId, userId);
      res.json(successResponse({ booking }));
    } catch (error) { next(error); }
  }

  // --- RECORDINGS ---

  async startRecording(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const consultationId = uuidSchema.parse(req.params.consultationId);
      const recording = await giriVisionService.createRecording(consultationId);
      res.status(201).json(successResponse({ recording }));
    } catch (error) { next(error); }
  }

  async getRecording(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const consultationId = uuidSchema.parse(req.params.consultationId);
      const recording = await giriVisionService.getRecording(consultationId);
      res.json(successResponse({ recording }));
    } catch (error) { next(error); }
  }

  async stopRecording(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // For now, just return success. Jitsi handles the actual recording stop.
      // We could update the recording metadata in the future if needed.
      res.json(successResponse({ message: 'Recording stopped' }));
    } catch (error) { next(error); }
  }

  async uploadRecording(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: { code: 'NO_FILE', message: 'No recording file uploaded' }
        });
        return;
      }

      // Get meeting_id from body
      const meetingId = req.body.meeting_id || 'unknown';
      const roomName = req.body.room_name || meetingId;
      const duration = req.body.duration ? parseInt(req.body.duration, 10) : null;

      // Save recording metadata to database
      const recording = await giriVisionService.createRecordingFromUpload({
        filePath: `/recordings/${file.filename}`,
        fileSize: file.size,
        duration,
        meetingId,
        roomName,
      });

      res.status(201).json(successResponse({
        success: true,
        recording_id: recording.id,
        url: `/recordings/${file.filename}`,
        size: file.size,
      }));
    } catch (error) {
      next(error);
    }
  }

  async listRecordings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;

      // Get recordings from database
      const recordings = await giriVisionService.listRecordings(workspaceId, userId);

      res.json(successResponse({ recordings }));
    } catch (error) { next(error); }
  }

  // --- REPORTS ---

  async generateReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const consultationId = uuidSchema.parse(req.params.consultationId);
      const report = await giriVisionService.generateAIReport(consultationId);
      res.json(successResponse({ report }));
    } catch (error) { next(error); }
  }

  async getReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const consultationId = uuidSchema.parse(req.params.consultationId);
      const report = await giriVisionService.getReport(consultationId);
      res.json(successResponse({ report }));
    } catch (error) { next(error); }
  }

  async updateReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reportId = uuidSchema.parse(req.params.reportId);
      const input = updateReportSchema.parse(req.body);
      const report = await giriVisionService.updateReport(reportId, input);
      res.json(successResponse({ report }));
    } catch (error) { next(error); }
  }

  // --- PROGRESS ---

  async recordProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const consultationId = uuidSchema.parse(req.params.consultationId);
      const consultation = await giriVisionService.getConsultation(consultationId);
      const data = progressSchema.parse(req.body);
      const progress = await giriVisionService.recordProgress(
        workspaceId, consultation.therapist_id, consultation.client_user_id, consultationId, data
      );
      res.status(201).json(successResponse({ progress }));
    } catch (error) { next(error); }
  }

  async getClientProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const therapistId = uuidSchema.parse(req.params.therapistId);
      const clientId = uuidSchema.parse(req.params.clientId);
      const progress = await giriVisionService.getClientProgress(therapistId, clientId);
      res.json(successResponse({ progress }));
    } catch (error) { next(error); }
  }
}

export const giriVisionController = new GiriVisionController();
