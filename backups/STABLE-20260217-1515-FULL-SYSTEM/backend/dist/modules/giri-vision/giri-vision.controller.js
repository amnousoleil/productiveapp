"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.giriVisionController = void 0;
const giri_vision_service_js_1 = require("./giri-vision.service.js");
exports.giriVisionController = {
    async createMeeting(req, res) {
        try {
            const user = req.user;
            const userId = user?.id || user?.email;
            const workspaceId = req.workspace?.id;
            if (!userId || !workspaceId) {
                res.status(401).json({ error: 'Non autorisé' });
                return;
            }
            const meeting = await giri_vision_service_js_1.giriVisionService.createMeeting(userId, workspaceId, req.body);
            res.json({ success: true, meeting });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async getMeetings(req, res) {
        try {
            const user = req.user;
            const userId = user?.id || user?.email;
            const workspaceId = req.workspace?.id;
            if (!userId || !workspaceId) {
                res.status(401).json({ error: 'Non autorisé' });
                return;
            }
            const meetings = await giri_vision_service_js_1.giriVisionService.getMeetings(workspaceId);
            const scheduled = await giri_vision_service_js_1.giriVisionService.getScheduled(workspaceId);
            res.json({ success: true, meetings, scheduled });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async getMeeting(req, res) {
        try {
            const meeting = await giri_vision_service_js_1.giriVisionService.getMeetingByRoomId(req.params.roomId);
            if (!meeting) {
                res.status(404).json({ error: 'Réunion introuvable' });
                return;
            }
            res.json({ success: true, meeting });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async joinMeeting(req, res) {
        try {
            const user = req.user;
            const name = req.body.participant_name || user?.name || user?.email || 'Participant';
            const meeting = await giri_vision_service_js_1.giriVisionService.joinMeeting(req.params.roomId, name);
            if (!meeting) {
                res.status(404).json({ error: 'Réunion introuvable' });
                return;
            }
            res.json({ success: true, meeting });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async endMeeting(req, res) {
        try {
            const meeting = await giri_vision_service_js_1.giriVisionService.endMeeting(req.params.roomId, req.body.duration_seconds);
            if (!meeting) {
                res.status(404).json({ error: 'Réunion introuvable' });
                return;
            }
            res.json({ success: true, meeting });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async deleteMeeting(req, res) {
        try {
            const user = req.user;
            const userId = user?.id || user?.email;
            const ok = await giri_vision_service_js_1.giriVisionService.deleteMeeting(req.params.roomId, userId);
            res.json({ success: ok });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
//# sourceMappingURL=giri-vision.controller.js.map