import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";
const app = express();
const PORT = 3000;
dotenv.config();

app.use(express.json());
app.use(express.static('public'));
app.use(cors({ origin: "http://localhost:5173" }));

app.post('/contact', async (req, res) => {
    const { firstName, lastName, email, message } = req.body;
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    try {
        await transporter.sendMail({
            from: `${firstName} ${lastName} <${email}>`,
            to: 'max.yang342@gmail.com',
            subject: 'New Contact Form Submission',
            text: `
                Name: ${firstName} ${lastName}
                Email: ${email}
                Message: ${message}
            `,
            replyTo: email,
        });
        res.send("Message sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send("Error sending message.");
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));