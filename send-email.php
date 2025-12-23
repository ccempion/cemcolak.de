<?php

ini_set('display_errors', 0); // Deaktiviere Anzeige von Fehlern
ini_set('display_startup_errors', 0);
error_reporting(E_ALL); // Fehler weiterhin protokollieren

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// $captcha = $_POST['g-recaptcha-response'];
// $secretKey = 'YOUR_SECRET_KEY';
// $response = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=$secretKey&response=$captcha");
// $responseKeys = json_decode($response, true);

// if (!$responseKeys["success"]) {
//     http_response_code(400);
//     echo json_encode(["error" => "CAPTCHA verification failed."]);
//     exit;
// }

// Funktion, um .env-Datei zu laden
function loadEnv($file) {
    if (!file_exists($file)) {
        return;
    }
    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue; // Kommentare überspringen
        }
        [$name, $value] = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

// Lade die .env-Datei
loadEnv(__DIR__ . '/.env');

// Hole die Umgebungsvariablen
$emailUser = $_ENV['EMAIL_USER'];
$emailPass = $_ENV['EMAIL_PASS'];
$receiverEmail = $_ENV['RECEIVER_EMAIL'];
$debugMode = 'false';

// Fehlerausgabe ins Log umleiten
if (!$debugMode) {
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/error.log'); // Fehler in error.log schreiben
}

header('Content-Type: application/json; charset=utf-8');

try {
    // Spam-Schutz: Honeypot prüfen
    if (!empty($_POST['honeypot'])) {
        http_response_code(400);
        echo json_encode(["error" => "Spam detected."]);
        exit;
    }

    // Verarbeite das Formular
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Empfange die Formulardaten
        $name = htmlspecialchars($_POST['name']);
        $email = htmlspecialchars($_POST['email']);
        $message = htmlspecialchars($_POST['message']);
        $body = "Absender: $name ($email)\n\nNachricht:\n$message";

        // Validierung der Eingaben
        if (empty($name) || empty($email) || empty($message)) {
            http_response_code(400);
            echo json_encode(["error" => "All fields (name, email, message) are required."]);
            exit;
        }

        // Validierung der Umgebungsvariablen
        if (empty($emailUser) || empty($emailPass) || empty($receiverEmail)) {
            http_response_code(500);
            echo json_encode(["error" => "E-Mail configuration is incomplete. Please check the .env file."]);
            exit;
        }

        // E-Mail senden mit PHPMailer
        $mail = new PHPMailer(true);
        try {
            // Debugging und SMTP-Einstellungen
            $mail->SMTPDebug = $debugMode ? 2 : 0; // Debug-Level abhängig von der Umgebung
            $mail->Debugoutput = 'error_log'; // Debugging-Ausgabe ins Error-Log
            $mail->isSMTP();
            $mail->Host = 'smtp.strato.de'; // Strato SMTP-Server
            $mail->SMTPAuth = true;
            $mail->Username = $emailUser;
            $mail->Password = $emailPass;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            // E-Mail-Header
            $mail->setFrom($emailUser, 'Your Website');
            $mail->addAddress($receiverEmail); // Empfänger
            $mail->addReplyTo($email, $name); // Antwort-Adresse

            // Nachricht
            $mail->isHTML(false);
            $mail->Subject = "New message from $name";
            $mail->Body = $body;

            // E-Mail senden
            $mail->send();

            // Erfolgreiche Antwort
            http_response_code(200);
            echo json_encode(["message" => "Your message has been sent successfully."]);
        } catch (Exception $e) {
            // Fehlerhafte Antwort
            http_response_code(500);
            if ($debugMode) {
                echo json_encode(["error" => "Message could not be sent. Mailer Error: " . $e->getMessage()]);
            } else {
                echo json_encode(["error" => "Message could not be sent. Please try again later."]);
            }
        }
    } else {
        // Wenn keine POST-Anfrage vorliegt
        http_response_code(405);
        echo json_encode(["error" => "Only POST requests are allowed."]);
    }
} catch (Exception $e) {
    // Allgemeiner Fehler
    http_response_code(500);
    if ($debugMode) {
        echo json_encode(["error" => "An unexpected error occurred: " . $e->getMessage()]);
    } else {
        echo json_encode(["error" => "An unexpected error occurred."]);
    }
}