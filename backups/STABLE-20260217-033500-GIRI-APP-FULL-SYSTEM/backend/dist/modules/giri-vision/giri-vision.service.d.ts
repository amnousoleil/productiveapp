import type { UUID } from '../../types/index.js';
import type { VisionMeeting, CreateMeetingInput } from './giri-vision.types.js';
export declare const giriVisionService: {
    createMeeting(userId: string, workspaceId: UUID, input: CreateMeetingInput): Promise<VisionMeeting>;
    getMeetings(workspaceId: UUID): Promise<VisionMeeting[]>;
    getMeetingByRoomId(roomId: string): Promise<VisionMeeting | null>;
    joinMeeting(roomId: string, participantName: string): Promise<VisionMeeting | null>;
    endMeeting(roomId: string, durationSeconds?: number): Promise<VisionMeeting | null>;
    deleteMeeting(roomId: string, userId: string): Promise<boolean>;
    getScheduled(workspaceId: UUID): Promise<VisionMeeting[]>;
};
//# sourceMappingURL=giri-vision.service.d.ts.map