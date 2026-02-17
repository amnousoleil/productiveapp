"use strict";
// =============================================
// EMAIL SERVICE - RESEND INTEGRATION
// Envoi d'emails transactionnels
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'ProductiveApp <noreply@giri-app.com>';
exports.EmailService = {
    /**
     * Envoie un email generique
     */
    async send(options) {
        try {
            const { data, error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            });
            if (error) {
                console.error('[EmailService] Error:', error);
                return false;
            }
            console.log('[EmailService] Email sent:', data?.id);
            return true;
        }
        catch (error) {
            console.error('[EmailService] Exception:', error);
            return false;
        }
    },
    /**
     * Email de bienvenue apres inscription
     */
    async sendWelcome(to, name) {
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="500" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(15,15,25,0.95) 0%, rgba(20,20,35,0.95) 100%); border-radius: 24px; border: 1px solid rgba(212,175,55,0.3); overflow: hidden;">
          <!-- Header with logo -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <img src="https://d1yei2z3i6k35z.cloudfront.net/15127401/69726e0a0f7c4_ChatGPTImage29d%C3%A9c.202514_44_011.png" alt="ProductiveApp" width="80" height="80" style="border-radius: 50%; box-shadow: 0 0 40px rgba(212,175,55,0.4);">
            </td>
          </tr>

          <!-- Welcome text -->
          <tr>
            <td align="center" style="padding: 20px 40px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #ffffff;">Bienvenue ${name} !</h1>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 40px 30px;">
              <p style="margin: 0; font-size: 16px; color: #a1a1aa; line-height: 1.6;">
                Ton compte ProductiveApp est pret.<br>
                Commence a organiser tes projets et atteindre tes objectifs.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 40px 40px;">
              <a href="https://giri-app.com" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); color: #000000; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(212,175,55,0.3);">
                Acceder a mon espace
              </a>
            </td>
          </tr>

          <!-- Features -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0 0 15px; font-size: 14px; color: #d4af37; font-weight: 600;">Ce que tu peux faire :</p>
              <p style="margin: 0; font-size: 14px; color: #a1a1aa; line-height: 1.8;">
                ✨ Creer et organiser tes taches<br>
                📊 Suivre ta productivite<br>
                👥 Collaborer avec ton equipe<br>
                🤖 Utiliser l'assistant IA
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 30px 40px; background: rgba(0,0,0,0.3);">
              <p style="margin: 0; font-size: 12px; color: #71717a;">
                ProductiveApp - Transforme ta vision en action<br>
                <a href="https://giri-app.com" style="color: #d4af37; text-decoration: none;">giri-app.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
        return this.send({
            to,
            subject: `Bienvenue sur ProductiveApp, ${name} !`,
            html,
            text: `Bienvenue ${name} ! Ton compte ProductiveApp est pret. Accede a ton espace : https://giri-app.com`
        });
    },
    /**
     * Email de reset mot de passe
     */
    async sendPasswordReset(to, name, resetToken) {
        const resetUrl = `https://giri-app.com/reset-password?token=${resetToken}`;
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="500" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(15,15,25,0.95) 0%, rgba(20,20,35,0.95) 100%); border-radius: 24px; border: 1px solid rgba(212,175,55,0.3); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <img src="https://d1yei2z3i6k35z.cloudfront.net/15127401/69726e0a0f7c4_ChatGPTImage29d%C3%A9c.202514_44_011.png" alt="ProductiveApp" width="80" height="80" style="border-radius: 50%; box-shadow: 0 0 40px rgba(212,175,55,0.4);">
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 20px 40px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">Reinitialiser ton mot de passe</h1>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 40px 30px;">
              <p style="margin: 0; font-size: 16px; color: #a1a1aa; line-height: 1.6;">
                Salut ${name},<br><br>
                Tu as demande a reinitialiser ton mot de passe.<br>
                Clique sur le bouton ci-dessous (valide 1 heure).
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 0 40px 40px;">
              <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); color: #000000; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(212,175,55,0.3);">
                Reinitialiser mon mot de passe
              </a>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 40px 30px;">
              <p style="margin: 0; font-size: 13px; color: #71717a;">
                Si tu n'as pas fait cette demande, ignore cet email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 30px 40px; background: rgba(0,0,0,0.3);">
              <p style="margin: 0; font-size: 12px; color: #71717a;">
                ProductiveApp<br>
                <a href="https://giri-app.com" style="color: #d4af37; text-decoration: none;">giri-app.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
        return this.send({
            to,
            subject: 'Reinitialise ton mot de passe - ProductiveApp',
            html,
            text: `Salut ${name}, clique sur ce lien pour reinitialiser ton mot de passe : ${resetUrl}`
        });
    },
    /**
     * Email d'invitation workspace
     */
    async sendWorkspaceInvitation(to, inviterName, workspaceName, inviteToken) {
        const inviteUrl = `https://giri-app.com/invite?token=${inviteToken}`;
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="500" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(15,15,25,0.95) 0%, rgba(20,20,35,0.95) 100%); border-radius: 24px; border: 1px solid rgba(212,175,55,0.3); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <img src="https://d1yei2z3i6k35z.cloudfront.net/15127401/69726e0a0f7c4_ChatGPTImage29d%C3%A9c.202514_44_011.png" alt="ProductiveApp" width="80" height="80" style="border-radius: 50%; box-shadow: 0 0 40px rgba(212,175,55,0.4);">
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 20px 40px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">Tu es invite !</h1>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 40px 30px;">
              <p style="margin: 0; font-size: 16px; color: #a1a1aa; line-height: 1.6;">
                <strong style="color: #d4af37;">${inviterName}</strong> t'invite a rejoindre<br>
                l'espace <strong style="color: #ffffff;">${workspaceName}</strong><br>
                sur ProductiveApp.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 0 40px 40px;">
              <a href="${inviteUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); color: #000000; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(212,175,55,0.3);">
                Accepter l'invitation
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 30px 40px; background: rgba(0,0,0,0.3);">
              <p style="margin: 0; font-size: 12px; color: #71717a;">
                ProductiveApp - Collaborez efficacement<br>
                <a href="https://giri-app.com" style="color: #d4af37; text-decoration: none;">giri-app.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
        return this.send({
            to,
            subject: `${inviterName} t'invite sur ${workspaceName} - ProductiveApp`,
            html,
            text: `${inviterName} t'invite a rejoindre ${workspaceName} sur ProductiveApp. Accepte l'invitation : ${inviteUrl}`
        });
    },
    /**
     * Email de verification d'adresse
     */
    async sendEmailVerification(to, name, verifyToken) {
        const verifyUrl = `https://giri-app.com/verify-email?token=${verifyToken}`;
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="500" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(15,15,25,0.95) 0%, rgba(20,20,35,0.95) 100%); border-radius: 24px; border: 1px solid rgba(212,175,55,0.3); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <img src="https://d1yei2z3i6k35z.cloudfront.net/15127401/69726e0a0f7c4_ChatGPTImage29d%C3%A9c.202514_44_011.png" alt="ProductiveApp" width="80" height="80" style="border-radius: 50%; box-shadow: 0 0 40px rgba(212,175,55,0.4);">
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 20px 40px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">Verifie ton email</h1>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 40px 30px;">
              <p style="margin: 0; font-size: 16px; color: #a1a1aa; line-height: 1.6;">
                Salut ${name},<br><br>
                Clique sur le bouton pour confirmer ton adresse email.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 0 40px 40px;">
              <a href="${verifyUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); color: #000000; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(212,175,55,0.3);">
                Verifier mon email
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 30px 40px; background: rgba(0,0,0,0.3);">
              <p style="margin: 0; font-size: 12px; color: #71717a;">
                ProductiveApp<br>
                <a href="https://giri-app.com" style="color: #d4af37; text-decoration: none;">giri-app.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
        return this.send({
            to,
            subject: 'Verifie ton adresse email - ProductiveApp',
            html,
            text: `Salut ${name}, verifie ton email en cliquant sur ce lien : ${verifyUrl}`
        });
    }
};
exports.default = exports.EmailService;
//# sourceMappingURL=email.service.js.map