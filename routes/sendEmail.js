// routes/sendEmail.js
import express from "express";
import nodemailer from "nodemailer";
import { Resend } from "resend";

const router = express.Router();

// Initialize Resend only if API key is available
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log("✅ Resend initialized");
} else {
  console.log("⚠️ RESEND_API_KEY not found, will use SMTP fallback");
}

// Handle preflight OPTIONS request
router.options("/", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});

router.post("/", async (req, res) => {
  const { to, subject, html, location } = req.body;
  console.log("Start to send email via SMTP");

  try {
    // Try Resend first (more reliable for cloud deployments)
    if (resend && process.env.RESEND_API_KEY) {
      console.log("🚀 Using Resend API for email delivery");

      // Use your verified domain now!
      const fromEmail =
        location === "M"
          ? "help@365solutionsjo.com"
          : "irbid@365solutionsjo.com";
      const fromName = location === "M" ? "365Solutions" : "365Solutions Irbid";

      const result = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: to,
        subject: subject,
        html: html,
      });

      // Handle Resend response
      if (result.error) {
        console.error("❌ Resend API Error:", result.error);
        console.log("⬇️ Falling back to SMTP due to Resend error");
      } else {
        console.log("✅ Email sent via Resend:", result.data?.id || result.id);
        console.log("📧 Full result:", JSON.stringify(result, null, 2));
        return res.status(200).json({
          success: true,
          messageId: result.data?.id || result.id,
          provider: "resend",
          fromDomain: "365solutionsjo.com",
        });
      }
    }

    // Fallback to SMTP with improved error handling
    console.log("📧 Using SMTP for email delivery");
    console.log(
      `📍 Attempting to send to: ${to} from: ${location === "M" ? "help@365solutionsjo.com" : "irbid@365solutionsjo.com"}`
    );

    // Configure SMTP settings based on location
    const smtpConfig = {
      host: "mail.365solutionsjo.com",
      port: 465,
      secure: true,
      connectionTimeout: 15000, // 15 seconds
      greetingTimeout: 10000, // 10 seconds
      socketTimeout: 15000, // 15 seconds
      auth: {
        user:
          location === "M"
            ? "help@365solutionsjo.com"
            : "irbid@365solutionsjo.com",
        pass: location === "M" ? "Help@365" : "irbid_123",
      },
    };

    // Create transporter
    const transporter = nodemailer.createTransporter(smtpConfig);

    // Verify connection first
    await transporter.verify();

    // Email options
    const mailOptions = {
      from: {
        name: "365Solutions",
        address:
          location === "M"
            ? "help@365solutionsjo.com"
            : "irbid@365solutionsjo.com",
      },
      to: to,
      subject: subject,
      html: html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent via SMTP:", info.messageId);
    res.status(200).json({
      success: true,
      messageId: info.messageId,
      provider: "smtp",
    });
  } catch (error) {
    console.error("❌ Email error:", error);

    // Provide more specific error messages
    if (error.code === "ETIMEDOUT") {
      return res.status(500).json({
        success: false,
        error:
          "Email server connection timeout. Please check server configuration.",
        details: error.message,
      });
    } else if (error.code === "EAUTH") {
      return res.status(500).json({
        success: false,
        error: "Email authentication failed. Please check credentials.",
        details: error.message,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: error.message,
        code: error.code,
      });
    }
  }
});

export default router;
