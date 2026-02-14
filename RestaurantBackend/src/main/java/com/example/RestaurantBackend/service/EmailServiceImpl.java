package com.example.RestaurantBackend.service;

import com.example.RestaurantBackend.model.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService{

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.from-name}")
    private String fromName;

    @Value("${app.frontend-url}")
    private String frontendUrl;


    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email to " + to, e);
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to encode sender name", e);
        }
    }


    @Override
    public void sendVerificationEmail(User user, String token) {

        String verificationUrl = this.frontendUrl + "/verify-email?token=" + token;

        Context context = new Context();
        context.setVariable("userName", user.getFirstName());
        context.setVariable("verificationUrl", verificationUrl);
        context.setVariable("expiryHours", "24");

        String htmlContent = templateEngine.process("emails/verification-email", context);

        sendHtmlEmail(user.getEmail(), "Verify Your Email - Smart Restaurant", htmlContent);
    }

    @Override
    public void sendPasswordResetEmail(User user, String token) {
        String resetUrl = this.frontendUrl + "/reset-password?token=" + token;

        Context context = new Context();
        context.setVariable("userName", user.getFirstName());
        context.setVariable("resetUrl", resetUrl);
        context.setVariable("expiryHours", "1");

        String htmlContent = templateEngine.process("emails/password-reset-email", context);

        sendHtmlEmail(user.getEmail(), "Reset Your password - Smart Restaurant", htmlContent);
    }
}
