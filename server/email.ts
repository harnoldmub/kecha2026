import { Resend } from "resend";
import { type RsvpResponse } from "@shared/schema";
import { kecha2026 } from "@shared/kecha2026";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendRsvpConfirmationEmail(rsvp: RsvpResponse) {
  if (!rsvp.email || !resend) return;

  const html = `
    <div style="font-family: 'Playfair Display', serif; background-color: #FAF9F6; padding: 40px; color: #1A1A1A; max-width: 600px; margin: auto; border: 1px solid #D4AF37;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-family: 'Great Vibes', cursive; font-size: 48px; color: #D4AF37; margin: 0;">${kecha2026.brand}</h1>
        <p style="text-transform: uppercase; letter-spacing: 4px; font-size: 10px; margin-top: 10px;">Invitation de ${kecha2026.couple.bride} & ${kecha2026.couple.groom}</p>
      </div>
      
      <div style="background-color: white; padding: 40px; border: 1px solid #F5F5DC;">
        <h2 style="font-style: italic; font-weight: normal; font-size: 24px; text-align: center;">Merci, ${rsvp.firstName}</h2>
        <p style="font-size: 14px; line-height: 1.6; text-align: center; color: #666;">
          Nous avons bien reçu votre réponse pour notre bénédiction. 
          C'est une joie immense de vous savoir à nos côtés pour ce moment précieux.
        </p>
        
        <div style="margin: 30px 0; padding: 20px; border-top: 1px solid #F5F5DC; border-bottom: 1px solid #F5F5DC;">
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; text-align: center;">Détails de votre réponse</p>
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="padding: 5px 0; color: #999;">Statut</td>
              <td style="padding: 5px 0; text-align: right; font-style: italic;">${rsvp.status === 'confirmed' ? 'Présent' : 'Non présent'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #999;">Nombre de personnes</td>
              <td style="padding: 5px 0; text-align: right; font-style: italic;">${rsvp.guestCount}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-top: 40px;">
          <a href="${process.env.APP_URL || ''}/invitation/${rsvp.token}" 
             style="display: inline-block; padding: 15px 30px; background-color: #D4AF37; color: white; text-decoration: none; text-transform: uppercase; letter-spacing: 2px; font-size: 10px;">
            Voir mon invitation
          </a>
        </div>
      </div>

      <div style="text-align: center; margin-top: 40px; font-size: 10px; opacity: 0.5; text-transform: uppercase; letter-spacing: 2px;">
        ${kecha2026.venues[0]?.name} • ${kecha2026.date.display}
      </div>
    </div>
  `;

  await resend.emails.send({
    from: "Kecha 2026 <invitations@replit.app>",
    to: [rsvp.email],
    subject: "Confirmation de votre RSVP - Kecha 2026",
    html,
  });
}
