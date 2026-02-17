import { sql } from '../../config/database.js';
import { generateUUID, AppError } from '../../utils/helpers.js';
import type { UUID } from '../../types/index.js';
import type {
  TherapistProfile,
  CreateTherapistProfileInput,
  UpdateTherapistProfileInput,
  AvailabilitySlot,
  CreateAvailabilitySlotInput,
  Consultation,
  CreateConsultationInput,
  UpdateConsultationInput,
  ConsultationWithDetails,
  Booking,
  CreateBookingInput,
  SessionRecording,
  SessionReport,
  UpdateSessionReportInput,
  ClientProgress,
  TherapistDashboard,
} from './giri-vision.types.js';

function generateRoomName(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'giri-';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export class GiriVisionService {

  // =============================================
  // THERAPIST PROFILES
  // =============================================

  async createProfile(userId: UUID, workspaceId: UUID, input: CreateTherapistProfileInput): Promise<TherapistProfile> {
    const id = generateUUID();
    const profiles = await sql`
      INSERT INTO therapist_profiles (id, user_id, workspace_id, specialties, bio, experience_years, certifications, languages, hourly_rate, currency, session_duration_minutes, auto_record, waiting_room_enabled, max_daily_sessions, buffer_minutes)
      VALUES (
        ${id}, ${userId}, ${workspaceId},
        ${input.specialties || []}, ${input.bio || null}, ${input.experience_years || 0},
        ${input.certifications || []}, ${input.languages || ['fr']},
        ${input.hourly_rate || 0}, ${input.currency || 'EUR'},
        ${input.session_duration_minutes || 60},
        ${input.auto_record ?? false}, ${input.waiting_room_enabled ?? true},
        ${input.max_daily_sessions || 8}, ${input.buffer_minutes || 15}
      )
      RETURNING *
    `;
    return profiles[0] as TherapistProfile;
  }

  async getProfile(userId: UUID, workspaceId: UUID): Promise<TherapistProfile | null> {
    const profiles = await sql`
      SELECT * FROM therapist_profiles WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
    `;
    return profiles.length > 0 ? profiles[0] as TherapistProfile : null;
  }

  async getProfileById(profileId: UUID): Promise<TherapistProfile> {
    const profiles = await sql`SELECT * FROM therapist_profiles WHERE id = ${profileId}`;
    if (profiles.length === 0) throw AppError.notFound('Therapist profile');
    return profiles[0] as TherapistProfile;
  }

  async updateProfile(profileId: UUID, input: UpdateTherapistProfileInput): Promise<TherapistProfile> {
    const updates: any = {};
    if (input.specialties !== undefined) updates.specialties = input.specialties;
    if (input.bio !== undefined) updates.bio = input.bio;
    if (input.experience_years !== undefined) updates.experience_years = input.experience_years;
    if (input.certifications !== undefined) updates.certifications = input.certifications;
    if (input.languages !== undefined) updates.languages = input.languages;
    if (input.hourly_rate !== undefined) updates.hourly_rate = input.hourly_rate;
    if (input.session_duration_minutes !== undefined) updates.session_duration_minutes = input.session_duration_minutes;
    if (input.availability_status !== undefined) updates.availability_status = input.availability_status;
    if (input.auto_record !== undefined) updates.auto_record = input.auto_record;
    if (input.waiting_room_enabled !== undefined) updates.waiting_room_enabled = input.waiting_room_enabled;
    if (input.max_daily_sessions !== undefined) updates.max_daily_sessions = input.max_daily_sessions;
    if (input.buffer_minutes !== undefined) updates.buffer_minutes = input.buffer_minutes;

    const profiles = await sql`
      UPDATE therapist_profiles SET ${sql(updates)} WHERE id = ${profileId} RETURNING *
    `;
    if (profiles.length === 0) throw AppError.notFound('Therapist profile');
    return profiles[0] as TherapistProfile;
  }

  async listTherapists(workspaceId: UUID): Promise<TherapistProfile[]> {
    const profiles = await sql`
      SELECT tp.*, u.name as user_name, u.avatar_url
      FROM therapist_profiles tp
      JOIN users u ON u.id = tp.user_id
      WHERE tp.workspace_id = ${workspaceId}
      ORDER BY tp.average_rating DESC, tp.total_sessions DESC
    `;
    return profiles as unknown as TherapistProfile[];
  }

  // =============================================
  // AVAILABILITY
  // =============================================

  async setAvailabilitySlots(therapistId: UUID, slots: CreateAvailabilitySlotInput[]): Promise<AvailabilitySlot[]> {
    await sql`DELETE FROM therapist_availability_slots WHERE therapist_id = ${therapistId}`;
    const results: AvailabilitySlot[] = [];
    for (const slot of slots) {
      const id = generateUUID();
      const rows = await sql`
        INSERT INTO therapist_availability_slots (id, therapist_id, day_of_week, start_time, end_time)
        VALUES (${id}, ${therapistId}, ${slot.day_of_week}, ${slot.start_time}, ${slot.end_time})
        RETURNING *
      `;
      results.push(rows[0] as AvailabilitySlot);
    }
    return results;
  }

  async getAvailabilitySlots(therapistId: UUID): Promise<AvailabilitySlot[]> {
    const slots = await sql`
      SELECT * FROM therapist_availability_slots
      WHERE therapist_id = ${therapistId} AND is_active = true
      ORDER BY day_of_week, start_time
    `;
    return slots as unknown as AvailabilitySlot[];
  }

  async getAvailableSlots(therapistId: UUID, date: string): Promise<{ start: string; end: string }[]> {
    const dayOfWeek = new Date(date).getDay();
    const profile = await this.getProfileById(therapistId);

    const slots = await sql`
      SELECT start_time, end_time FROM therapist_availability_slots
      WHERE therapist_id = ${therapistId} AND day_of_week = ${dayOfWeek} AND is_active = true
      ORDER BY start_time
    `;

    const booked = await sql`
      SELECT scheduled_at, duration_minutes FROM consultations
      WHERE therapist_id = ${therapistId}
        AND DATE(scheduled_at) = ${date}
        AND status NOT IN ('cancelled', 'no_show')
    `;

    const available: { start: string; end: string }[] = [];
    for (const slot of slots) {
      let current = slot.start_time as string;
      const slotEnd = slot.end_time as string;

      while (current < slotEnd) {
        const nextEnd = addMinutes(current, profile.session_duration_minutes);
        if (nextEnd > slotEnd) break;

        const isBooked = booked.some((b: any) => {
          const bStart = new Date(b.scheduled_at).toTimeString().slice(0, 5);
          const bEnd = addMinutes(bStart, b.duration_minutes);
          return current < bEnd && nextEnd > bStart;
        });

        if (!isBooked) {
          available.push({ start: current, end: nextEnd });
        }
        current = addMinutes(current, profile.session_duration_minutes + profile.buffer_minutes);
      }
    }

    return available;
  }

  // =============================================
  // CONSULTATIONS
  // =============================================

  async createConsultation(workspaceId: UUID, input: CreateConsultationInput): Promise<Consultation> {
    const id = generateUUID();
    const roomName = generateRoomName();
    const profile = await this.getProfileById(input.therapist_id);

    const consultations = await sql`
      INSERT INTO consultations (id, workspace_id, therapist_id, client_user_id, scheduled_at, duration_minutes, room_name, amount, currency, status)
      VALUES (
        ${id}, ${workspaceId}, ${input.therapist_id}, ${input.client_user_id},
        ${input.scheduled_at}, ${input.duration_minutes || profile.session_duration_minutes},
        ${roomName}, ${input.amount || profile.hourly_rate}, ${profile.currency}, 'scheduled'
      )
      RETURNING *
    `;
    return consultations[0] as Consultation;
  }

  async getConsultation(consultationId: UUID): Promise<ConsultationWithDetails> {
    const consultations = await sql`
      SELECT c.*,
        tu.name as therapist_name, tu.avatar_url as therapist_avatar,
        cu.name as client_name, cu.avatar_url as client_avatar,
        EXISTS(SELECT 1 FROM session_recordings sr WHERE sr.consultation_id = c.id) as has_recording,
        EXISTS(SELECT 1 FROM session_reports sr WHERE sr.consultation_id = c.id) as has_report
      FROM consultations c
      JOIN therapist_profiles tp ON tp.id = c.therapist_id
      JOIN users tu ON tu.id = tp.user_id
      JOIN users cu ON cu.id = c.client_user_id
      WHERE c.id = ${consultationId}
    `;
    if (consultations.length === 0) throw AppError.notFound('Consultation');
    return consultations[0] as ConsultationWithDetails;
  }

  async listConsultations(workspaceId: UUID, userId: UUID, _filters: { role?: string; status?: string; from?: string; to?: string }): Promise<ConsultationWithDetails[]> {
    const consultations = await sql`
      SELECT c.*,
        tu.name as therapist_name, tu.avatar_url as therapist_avatar,
        cu.name as client_name, cu.avatar_url as client_avatar
      FROM consultations c
      JOIN therapist_profiles tp ON tp.id = c.therapist_id
      JOIN users tu ON tu.id = tp.user_id
      JOIN users cu ON cu.id = c.client_user_id
      WHERE c.workspace_id = ${workspaceId}
        AND (tp.user_id = ${userId} OR c.client_user_id = ${userId})
      ORDER BY c.scheduled_at DESC
      LIMIT 50
    `;
    return consultations as unknown as ConsultationWithDetails[];
  }

  async getUpcomingConsultations(workspaceId: UUID, userId: UUID, limit: number = 10): Promise<ConsultationWithDetails[]> {
    const consultations = await sql`
      SELECT c.*,
        tu.name as therapist_name, tu.avatar_url as therapist_avatar,
        cu.name as client_name, cu.avatar_url as client_avatar
      FROM consultations c
      JOIN therapist_profiles tp ON tp.id = c.therapist_id
      JOIN users tu ON tu.id = tp.user_id
      JOIN users cu ON cu.id = c.client_user_id
      WHERE c.workspace_id = ${workspaceId}
        AND (tp.user_id = ${userId} OR c.client_user_id = ${userId})
        AND c.status IN ('scheduled', 'waiting')
        AND c.scheduled_at >= NOW()
      ORDER BY c.scheduled_at ASC
      LIMIT ${limit}
    `;
    return consultations as unknown as ConsultationWithDetails[];
  }

  async getTodayConsultations(therapistId: UUID): Promise<ConsultationWithDetails[]> {
    const consultations = await sql`
      SELECT c.*,
        cu.name as client_name, cu.avatar_url as client_avatar
      FROM consultations c
      JOIN users cu ON cu.id = c.client_user_id
      WHERE c.therapist_id = ${therapistId}
        AND DATE(c.scheduled_at) = CURRENT_DATE
        AND c.status NOT IN ('cancelled', 'no_show')
      ORDER BY c.scheduled_at ASC
    `;
    return consultations as unknown as ConsultationWithDetails[];
  }

  async updateConsultation(consultationId: UUID, input: UpdateConsultationInput): Promise<Consultation> {
    const updates: any = {};
    if (input.status !== undefined) updates.status = input.status;
    if (input.therapist_notes !== undefined) updates.therapist_notes = input.therapist_notes;
    if (input.therapist_private_notes !== undefined) updates.therapist_private_notes = input.therapist_private_notes;
    if (input.client_rating !== undefined) updates.client_rating = input.client_rating;
    if (input.client_feedback !== undefined) updates.client_feedback = input.client_feedback;

    if (input.status === 'in_progress') {
      updates.started_at = new Date();
    } else if (input.status === 'completed') {
      updates.ended_at = new Date();
      const consultation = await this.getConsultation(consultationId);
      if (consultation.started_at) {
        updates.actual_duration_minutes = Math.round(
          (new Date().getTime() - new Date(consultation.started_at).getTime()) / 60000
        );
      }
    }

    const consultations = await sql`
      UPDATE consultations SET ${sql(updates)} WHERE id = ${consultationId} RETURNING *
    `;
    if (consultations.length === 0) throw AppError.notFound('Consultation');
    return consultations[0] as Consultation;
  }

  async joinWaitingRoom(consultationId: UUID, userId: UUID): Promise<Consultation> {
    const consultation = await this.getConsultation(consultationId);
    if (consultation.client_user_id !== userId) {
      throw AppError.forbidden('Not your consultation');
    }
    return this.updateConsultation(consultationId, { status: 'waiting' });
  }

  async startConsultation(consultationId: UUID, userId: UUID): Promise<Consultation> {
    const consultation = await this.getConsultation(consultationId);
    const profile = await this.getProfileById(consultation.therapist_id);
    if (profile.user_id !== userId) {
      throw AppError.forbidden('Only the therapist can start the consultation');
    }
    return this.updateConsultation(consultationId, { status: 'in_progress' });
  }

  async endConsultation(consultationId: UUID, userId: UUID): Promise<Consultation> {
    const consultation = await this.getConsultation(consultationId);
    const profile = await this.getProfileById(consultation.therapist_id);
    if (profile.user_id !== userId) {
      throw AppError.forbidden('Only the therapist can end the consultation');
    }
    return this.updateConsultation(consultationId, { status: 'completed' });
  }

  // =============================================
  // BOOKINGS
  // =============================================

  async createBooking(workspaceId: UUID, clientUserId: UUID, input: CreateBookingInput): Promise<Booking> {
    const id = generateUUID();
    const bookings = await sql`
      INSERT INTO consultation_bookings (id, workspace_id, therapist_id, client_user_id, requested_at, client_message, status)
      VALUES (${id}, ${workspaceId}, ${input.therapist_id}, ${clientUserId}, ${input.requested_at}, ${input.client_message || null}, 'pending')
      RETURNING *
    `;
    return bookings[0] as Booking;
  }

  async confirmBooking(bookingId: UUID, therapistUserId: UUID, response?: string): Promise<{ booking: Booking; consultation: Consultation }> {
    const bookings = await sql`SELECT * FROM consultation_bookings WHERE id = ${bookingId}`;
    if (bookings.length === 0) throw AppError.notFound('Booking');
    const booking = bookings[0] as Booking;

    const profile = await this.getProfileById(booking.therapist_id);
    if (profile.user_id !== therapistUserId) throw AppError.forbidden('Not your booking');

    const consultation = await this.createConsultation(booking.workspace_id, {
      therapist_id: booking.therapist_id,
      client_user_id: booking.client_user_id,
      scheduled_at: booking.requested_at.toISOString(),
    });

    const updated = await sql`
      UPDATE consultation_bookings SET
        status = 'confirmed',
        consultation_id = ${consultation.id},
        therapist_response = ${response || null},
        responded_at = NOW()
      WHERE id = ${bookingId} RETURNING *
    `;

    return { booking: updated[0] as Booking, consultation };
  }

  async cancelBooking(bookingId: UUID, userId: UUID): Promise<Booking> {
    const bookings = await sql`
      UPDATE consultation_bookings SET status = 'cancelled', responded_at = NOW()
      WHERE id = ${bookingId} AND (client_user_id = ${userId} OR therapist_id IN (
        SELECT id FROM therapist_profiles WHERE user_id = ${userId}
      ))
      RETURNING *
    `;
    if (bookings.length === 0) throw AppError.notFound('Booking');
    return bookings[0] as Booking;
  }

  async getPendingBookings(therapistId: UUID): Promise<Booking[]> {
    const bookings = await sql`
      SELECT cb.*, u.name as client_name, u.avatar_url as client_avatar
      FROM consultation_bookings cb
      JOIN users u ON u.id = cb.client_user_id
      WHERE cb.therapist_id = ${therapistId} AND cb.status = 'pending'
      ORDER BY cb.requested_at ASC
    `;
    return bookings as unknown as Booking[];
  }

  // =============================================
  // RECORDINGS
  // =============================================

  async createRecording(consultationId: UUID): Promise<SessionRecording> {
    const id = generateUUID();
    const recordings = await sql`
      INSERT INTO session_recordings (id, consultation_id, status)
      VALUES (${id}, ${consultationId}, 'recording')
      RETURNING *
    `;
    return recordings[0] as SessionRecording;
  }

  async updateRecording(recordingId: UUID, updates: Partial<SessionRecording>): Promise<SessionRecording> {
    const recordings = await sql`
      UPDATE session_recordings SET ${sql(updates)} WHERE id = ${recordingId} RETURNING *
    `;
    if (recordings.length === 0) throw AppError.notFound('Recording');
    return recordings[0] as SessionRecording;
  }

  async getRecording(consultationId: UUID): Promise<SessionRecording | null> {
    const recordings = await sql`
      SELECT * FROM session_recordings WHERE consultation_id = ${consultationId} ORDER BY created_at DESC LIMIT 1
    `;
    return recordings.length > 0 ? recordings[0] as SessionRecording : null;
  }

  async createRecordingFromUpload(data: {
    filePath: string;
    fileSize: number;
    duration: number | null;
    meetingId: string;
    roomName: string;
  }): Promise<SessionRecording> {
    const id = generateUUID();

    // Try to find existing consultation by room_name
    const consultations = await sql`
      SELECT id FROM consultations WHERE room_name = ${data.roomName} ORDER BY created_at DESC LIMIT 1
    `;
    const consultationId = consultations.length > 0 ? consultations[0].id as UUID : null;

    const recordings = await sql`
      INSERT INTO session_recordings (
        id,
        consultation_id,
        recording_url,
        file_size,
        duration_seconds,
        status
      )
      VALUES (
        ${id},
        ${consultationId},
        ${data.filePath},
        ${data.fileSize},
        ${data.duration},
        'completed'
      )
      RETURNING *
    `;
    return recordings[0] as SessionRecording;
  }

  async listRecordings(workspaceId: UUID, userId: UUID): Promise<SessionRecording[]> {
    const recordings = await sql`
      SELECT sr.*,
        c.room_name,
        c.scheduled_at,
        c.therapist_id,
        c.client_user_id,
        tu.name as therapist_name,
        cu.name as client_name
      FROM session_recordings sr
      LEFT JOIN consultations c ON c.id = sr.consultation_id
      LEFT JOIN therapist_profiles tp ON tp.id = c.therapist_id
      LEFT JOIN users tu ON tu.id = tp.user_id
      LEFT JOIN users cu ON cu.id = c.client_user_id
      WHERE (
        c.workspace_id = ${workspaceId}
        AND (tp.user_id = ${userId} OR c.client_user_id = ${userId})
      )
      OR sr.consultation_id IS NULL
      ORDER BY sr.created_at DESC
      LIMIT 100
    `;
    return recordings as unknown as SessionRecording[];
  }

  // =============================================
  // SESSION REPORTS
  // =============================================

  async createReport(consultationId: UUID, therapistId: UUID): Promise<SessionReport> {
    const id = generateUUID();
    const reports = await sql`
      INSERT INTO session_reports (id, consultation_id, therapist_id, status)
      VALUES (${id}, ${consultationId}, ${therapistId}, 'draft')
      RETURNING *
    `;
    return reports[0] as SessionReport;
  }

  async getReport(consultationId: UUID): Promise<SessionReport | null> {
    const reports = await sql`
      SELECT * FROM session_reports WHERE consultation_id = ${consultationId} ORDER BY created_at DESC LIMIT 1
    `;
    return reports.length > 0 ? reports[0] as SessionReport : null;
  }

  async updateReport(reportId: UUID, input: UpdateSessionReportInput): Promise<SessionReport> {
    const updates: any = { ...input };
    if (input.status === 'reviewed') updates.reviewed_at = new Date();
    if (input.status === 'published') updates.published_at = new Date();

    const reports = await sql`
      UPDATE session_reports SET ${sql(updates)} WHERE id = ${reportId} RETURNING *
    `;
    if (reports.length === 0) throw AppError.notFound('Session report');
    return reports[0] as SessionReport;
  }

  async generateAIReport(consultationId: UUID): Promise<SessionReport> {
    const consultation = await this.getConsultation(consultationId);
    const recording = await this.getRecording(consultationId);

    let report = await this.getReport(consultationId);
    if (!report) {
      report = await this.createReport(consultationId, consultation.therapist_id);
    }

    // Generate AI summary based on therapist notes and/or transcription
    const sourceText = recording?.transcription_text || consultation.therapist_notes || '';

    const aiSummary = sourceText
      ? `Résumé automatique de la séance du ${new Date(consultation.scheduled_at).toLocaleDateString('fr-FR')} - ${consultation.therapist_name || 'Thérapeute'} avec ${consultation.client_name || 'Client'}. ${sourceText.substring(0, 500)}`
      : `Séance du ${new Date(consultation.scheduled_at).toLocaleDateString('fr-FR')} - Aucune note ou transcription disponible.`;

    const updated = await sql`
      UPDATE session_reports SET
        ai_summary = ${aiSummary},
        ai_key_themes = ${JSON.stringify(['Séance enregistrée'])},
        ai_action_items = ${JSON.stringify(['Revoir les notes'])},
        status = 'draft'
      WHERE id = ${report.id} RETURNING *
    `;

    return updated[0] as SessionReport;
  }

  // =============================================
  // CLIENT PROGRESS
  // =============================================

  async recordProgress(workspaceId: UUID, therapistId: UUID, clientUserId: UUID, consultationId: UUID | null, data: { wellbeing_score?: number; anxiety_level?: number; mood_score?: number }): Promise<ClientProgress> {
    const id = generateUUID();
    const lastSession = await sql`
      SELECT MAX(session_number) as max_num FROM client_progress
      WHERE therapist_id = ${therapistId} AND client_user_id = ${clientUserId}
    `;
    const sessionNumber = (lastSession[0]?.max_num || 0) + 1;

    const rows = await sql`
      INSERT INTO client_progress (id, workspace_id, therapist_id, client_user_id, consultation_id, session_number, wellbeing_score, anxiety_level, mood_score)
      VALUES (${id}, ${workspaceId}, ${therapistId}, ${clientUserId}, ${consultationId}, ${sessionNumber}, ${data.wellbeing_score || null}, ${data.anxiety_level || null}, ${data.mood_score || null})
      RETURNING *
    `;
    return rows[0] as ClientProgress;
  }

  async getClientProgress(therapistId: UUID, clientUserId: UUID): Promise<ClientProgress[]> {
    const rows = await sql`
      SELECT * FROM client_progress
      WHERE therapist_id = ${therapistId} AND client_user_id = ${clientUserId}
      ORDER BY session_number ASC
    `;
    return rows as unknown as ClientProgress[];
  }

  // =============================================
  // DASHBOARD
  // =============================================

  async getTherapistDashboard(userId: UUID, workspaceId: UUID): Promise<TherapistDashboard> {
    let profile = await this.getProfile(userId, workspaceId);
    if (!profile) {
      profile = await this.createProfile(userId, workspaceId, {});
    }

    const todaySessions = await this.getTodayConsultations(profile.id);
    const upcomingSessions = await this.getUpcomingConsultations(workspaceId, userId, 5);
    const pendingBookings = await this.getPendingBookings(profile.id);

    const monthStats = await sql`
      SELECT
        COUNT(*) as session_count,
        COALESCE(SUM(amount), 0) as revenue
      FROM consultations
      WHERE therapist_id = ${profile.id}
        AND status = 'completed'
        AND DATE_TRUNC('month', scheduled_at) = DATE_TRUNC('month', CURRENT_DATE)
    `;

    return {
      profile,
      today_sessions: todaySessions,
      upcoming_sessions: upcomingSessions,
      pending_bookings: pendingBookings,
      stats: {
        total_sessions: profile.total_sessions,
        total_hours: Number(profile.total_hours),
        average_rating: Number(profile.average_rating),
        this_month_sessions: Number(monthStats[0]?.session_count || 0),
        this_month_revenue: Number(monthStats[0]?.revenue || 0),
      },
    };
  }
}

// =============================================
// HELPERS
// =============================================

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

export const giriVisionService = new GiriVisionService();
