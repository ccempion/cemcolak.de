// Importiere die notwendigen Pakete
require("dotenv").config(); // Für Umgebungsvariablen (Installiere dotenv vorher mit: npm install dotenv)
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit"); // Installiere express-rate-limit vorher mit: npm install express-rate-limit

const app = express();
const PORT = 3000; // Stelle sicher, dass der Port nicht bereits von einem anderen Prozess genutzt wird

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate Limiting: Limitiere die Anzahl der Anfragen, die innerhalb eines bestimmten Zeitraums gesendet werden können
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Zeitfenster von 15 Minuten
  max: 100, // Maximal 100 Anfragen pro IP innerhalb des Zeitfensters
  message: "Zu viele Anfragen von dieser IP, bitte versuchen Sie es später erneut.",
});

// Anwenden des Rate-Limiters auf alle Routen
app.use(limiter);

// SMTP-Konfiguration für Nodemailer
const transporter = nodemailer.createTransport({
    host: "smtp.strato.de", // SMTP-Server von Strato
    port: 465, // SSL-Port (alternativ: 587 für STARTTLS)
    secure: true, // true für SSL, false für STARTTLS
    auth: {
      user: process.env.EMAIL_USER, // Deine Strato-Absenderadresse, z. B. info@deinedomain.de
      pass: process.env.EMAIL_PASS, // Dein Strato-Mailpasswort
    },
  });

// POST-Endpunkt für das Kontaktformular
app.post("/send-email", (req, res) => {
  const { name, email, message } = req.body;

  // Validierung der Eingaben
  if (!name || !email || !message) {
    return res.status(400).send("Alle Felder (Name, Email, Nachricht) sind erforderlich.");
  }

  // Konfiguration der E-Mail
  const mailOptions = {
    from: email, // E-Mail-Adresse des Absenders (Nutzer)
    to: process.env.RECEIVER_EMAIL, // In der .env-Datei definieren: RECEIVER_EMAIL=dein-empfangs-email@gmail.com
    subject: `Neue Nachricht von ${name}`,
    text: `Absender: ${name} (${email})\n\nNachricht:\n${message}`,
  };

  // Sende die E-Mail
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Fehler beim Versenden der E-Mail:", error);
      return res.status(500).send("Es gab einen Fehler beim Versenden der Nachricht. Bitte versuchen Sie es später erneut.");
    }
    console.log("E-Mail erfolgreich versendet:", info.response);
    res.status(200).send("Nachricht erfolgreich versendet.");
  });
});

// Starte den Server
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});