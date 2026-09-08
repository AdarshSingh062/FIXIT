const { sendEmail } = require('../config/mailer');

const getBaseStyles = () => `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #1f2937;
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

const getButtonStyles = () => `
  display: inline-block;
  background-color: #2563eb;
  color: #ffffff;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  margin-top: 16px;
`;

const emailService = {
  sendWelcomeEmail: async (user) => {
    const subject = `Welcome to FixIt, ${user.name}!`;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const html = `
      <div style="${getBaseStyles()}">
        <h2 style="color: #2563eb; margin-top: 0;">Welcome to FixIt! 🛠️</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Thank you for joining FixIt, your community-driven local issue reporting and service management platform.</p>
        <p>With FixIt, you can report civic issues, track real-time resolution progress, and ensure your neighborhood stays safe and well-maintained.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${clientUrl}/dashboard" style="${getButtonStyles()}">Go to Your Dashboard</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #6b7280;">If you did not sign up for this account, please ignore this email.</p>
      </div>
    `;
    return sendEmail({ to: user.email, subject, html, text: `Welcome to FixIt, ${user.name}!` });
  },

  sendComplaintSubmittedEmail: async (user, complaint) => {
    const subject = `Issue Reported: ${complaint.title} [#${complaint._id.toString().slice(-6)}]`;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const html = `
      <div style="${getBaseStyles()}">
        <h2 style="color: #2563eb; margin-top: 0;">Issue Submitted Successfully</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your issue has been recorded in our system with priority: <strong style="color: #ea580c;">${complaint.priority}</strong>.</p>
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #2563eb;">
          <p style="margin: 0 0 8px;"><strong>Title:</strong> ${complaint.title}</p>
          <p style="margin: 0 0 8px;"><strong>Location:</strong> ${complaint.location?.address || 'Reported Map Location'}</p>
          <p style="margin: 0;"><strong>Status:</strong> ${complaint.status}</p>
        </div>
        <p>Our dispatch team will review your report and assign a municipal service specialist shortly.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${clientUrl}/complaints/${complaint._id}" style="${getButtonStyles()}">Track Issue Live</a>
        </div>
      </div>
    `;
    return sendEmail({ to: user.email, subject, html, text: `Your issue "${complaint.title}" has been submitted.` });
  },

  sendTaskAssignedWorkerEmail: async (worker, complaint) => {
    const subject = `New Task Assigned: ${complaint.title} [Priority: ${complaint.priority}]`;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const html = `
      <div style="${getBaseStyles()}">
        <h2 style="color: #2563eb; margin-top: 0;">New Task Assignment</h2>
        <p>Hi <strong>${worker.name}</strong>,</p>
        <p>You have been assigned a new issue on FixIt requiring your attention.</p>
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0 0 8px;"><strong>Title:</strong> ${complaint.title}</p>
          <p style="margin: 0 0 8px;"><strong>Priority:</strong> ${complaint.priority}</p>
          <p style="margin: 0;"><strong>Location:</strong> ${complaint.location?.address || 'Map Location'}</p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${clientUrl}/worker/tasks/${complaint._id}" style="${getButtonStyles()}">View & Accept Task</a>
        </div>
      </div>
    `;
    return sendEmail({ to: worker.email, subject, html, text: `You have been assigned task "${complaint.title}".` });
  },

  sendComplaintStatusUpdatedEmail: async (user, complaint, newStatus, note = '') => {
    const subject = `Status Update: ${complaint.title} is now "${newStatus}"`;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const html = `
      <div style="${getBaseStyles()}">
        <h2 style="color: #2563eb; margin-top: 0;">Status Update on Your Issue</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>The status of your reported issue <strong>"${complaint.title}"</strong> has changed to:</p>
        <div style="background-color: #ecfdf5; padding: 16px; border-radius: 6px; margin: 16px 0; border: 1px solid #a7f3d0;">
          <h3 style="margin: 0 0 8px; color: #065f46;">${newStatus}</h3>
          ${note ? `<p style="margin: 0; color: #047857;"><strong>Note:</strong> ${note}</p>` : ''}
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${clientUrl}/complaints/${complaint._id}" style="${getButtonStyles()}">View Full Progress Details</a>
        </div>
      </div>
    `;
    return sendEmail({ to: user.email, subject, html, text: `Your issue "${complaint.title}" status is now ${newStatus}.` });
  },

  sendComplaintResolvedEmail: async (user, complaint) => {
    const subject = `Resolved: Please verify and rate resolution for "${complaint.title}"`;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const html = `
      <div style="${getBaseStyles()}">
        <h2 style="color: #16a34a; margin-top: 0;">Your Issue Has Been Marked Resolved! ✅</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Our service specialist has uploaded resolution evidence and completed work on <strong>"${complaint.title}"</strong>.</p>
        <p>Please review the resolution photos and rate the quality of service to complete the case closure.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${clientUrl}/complaints/${complaint._id}" style="${getButtonStyles()}">Verify & Rate Resolution</a>
        </div>
      </div>
    `;
    return sendEmail({ to: user.email, subject, html, text: `Your issue "${complaint.title}" has been resolved. Please rate the service.` });
  }
};

module.exports = emailService;
