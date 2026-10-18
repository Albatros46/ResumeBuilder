package com.ResumeBuilder.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    /**
     * Kayit sonrasi e-posta dogrulama maili.
     * Asenkron gonderilir; SMTP yavas veya hatali olsa bile kayit istegi beklemez.
     */
    @Async
    public void sendVerificationEmail(String toEmail, String name, String verificationLink) {
        String html = """
                <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
                  <h2 style="color:#2563eb">ResumeBuilder</h2>
                  <p>Merhaba %s,</p>
                  <p>Hesabınızı etkinleştirmek için lütfen e-posta adresinizi doğrulayın:</p>
                  <p><a href="%s" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;
                     text-decoration:none;border-radius:6px">E-postamı doğrula</a></p>
                  <p style="color:#666;font-size:13px">Bağlantı 24 saat geçerlidir. Buton çalışmazsa bu adresi
                     tarayıcınıza yapıştırın:<br>%s</p>
                </div>
                """.formatted(name, verificationLink, verificationLink);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from);
            helper.setTo(toEmail);
            helper.setSubject("ResumeBuilder - E-posta adresinizi doğrulayın");
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Doğrulama maili gönderildi: {}", toEmail);
        } catch (Exception e) {
            log.error("Doğrulama maili gönderilemedi ({}): {}", toEmail, e.getMessage());
        }
    }

    /**
     * E-posta dogrulandiktan sonra hos geldin maili
     */
    @Async
    public void sendRegistrationSuccessEmail(String toEmail, String name) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(toEmail);
            message.setSubject("ResumeBuilder'a Hoş Geldiniz!");

            String emailBody = """
                    Merhaba %s,

                    ResumeBuilder platformuna başarıyla kayıt oldunuz!

                    Artık CV'nizi oluşturabilir, düzenleyebilir ve indirebilirsiniz.

                    Başarılar dileriz!

                    Saygılarımızla,
                    ResumeBuilder Ekibi
                    """.formatted(name);

            message.setText(emailBody);

            mailSender.send(message);
            log.info("Hoş geldin maili gönderildi: {}", toEmail);

        } catch (Exception e) {
            log.error("Mail gönderilirken hata oluştu: {}", e.getMessage());
            // Mail gönderilememesi kayıt işlemini bozmasın
        }
    }
}
