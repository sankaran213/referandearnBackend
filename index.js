require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();

app.use(cors()); // Enable CORS for frontend requests
app.use(express.json());

// Endpoint to submit referral form
// Endpoint to submit referral form
app.post("/referral", async (req, res) => {
  try {
    const {
      referrerName,
      referrerEmail,
      referrerPhone,
      refereeName,
      refereeEmail,
      refereePhone,
      course,
    } = req.body;

    if (
      !referrerName ||
      !referrerEmail ||
      !referrerPhone ||
      !refereeName ||
      !refereeEmail ||
      !refereePhone ||
      !course
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        referrerPhone,
        refereeName,
        refereeEmail,
        refereePhone,
        course,
      },
    });

    await sendReferralEmail(refereeEmail, refereeName, referrerName);
    res
      .status(201)
      .json({ message: "Referral submitted successfully", referral });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Function to send an email using Yahoo Mail
async function sendReferralEmail(to, refereeName, referrerName, course) {
  let transporter = nodemailer.createTransport({
    host: "smtp.mail.yahoo.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.YAHOO_USER,
      pass: process.env.YAHOO_PASS,
    },
  });

  let mailOptions = {
    from: process.env.YAHOO_USER,
    to,
    subject: "Referral Submission Confirmation",
    text: `Hello ${refereeName},\n\nYou have been referred by ${referrerName} for the ${course} program. Thank you!\n\nBest regards,\nYour Company Name`,
  };

  await transporter.sendMail(mailOptions);
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
