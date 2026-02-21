package com.example.RestaurantBackend.service;

import com.example.RestaurantBackend.model.Table;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class PdfService {

    @Value("${app.restaurant.name}")
    private String restaurantName;

    public byte[] generateTableQrPdf(Table table, BufferedImage qrImage) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            float pageWidth = page.getMediaBox().getWidth();
            float pageHeight = page.getMediaBox().getHeight();

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                // Restaurant Name (Header)
                PDType1Font headerFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                contentStream.setFont(headerFont, 28);
                float headerWidth = headerFont.getStringWidth(restaurantName) / 1000 * 28;
                contentStream.beginText();
                contentStream.newLineAtOffset((pageWidth - headerWidth) / 2, pageHeight - 80);
                contentStream.showText(restaurantName);
                contentStream.endText();

                // Table Number
                String tableText = "Table " + table.getTableNumber();
                PDType1Font tableFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                contentStream.setFont(tableFont, 36);
                float tableWidth = tableFont.getStringWidth(tableText) / 1000 * 36;
                contentStream.beginText();
                contentStream.newLineAtOffset((pageWidth - tableWidth) / 2, pageHeight - 140);
                contentStream.showText(tableText);
                contentStream.endText();

                // Capacity Info
                String capacityText = "Capacity: " + table.getCapacity() + " seats";
                PDType1Font infoFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
                contentStream.setFont(infoFont, 14);
                float capacityWidth = infoFont.getStringWidth(capacityText) / 1000 * 14;
                contentStream.beginText();
                contentStream.newLineAtOffset((pageWidth - capacityWidth) / 2, pageHeight - 170);
                contentStream.showText(capacityText);
                contentStream.endText();

                // Location Info (if available)
                if (table.getLocation() != null && !table.getLocation().isEmpty()) {
                    String locationText = "Location: " + table.getLocation();
                    float locationWidth = infoFont.getStringWidth(locationText) / 1000 * 14;
                    contentStream.beginText();
                    contentStream.newLineAtOffset((pageWidth - locationWidth) / 2, pageHeight - 190);
                    contentStream.showText(locationText);
                    contentStream.endText();
                }

                // QR Code Image (centered)
                PDImageXObject pdImage = LosslessFactory.createFromImage(document, qrImage);
                float qrSize = 250;
                float qrX = (pageWidth - qrSize) / 2;
                float qrY = (pageHeight - qrSize) / 2 - 50;
                contentStream.drawImage(pdImage, qrX, qrY, qrSize, qrSize);

                // "Scan to Order" Text
                String scanText = "Scan to View Menu & Order";
                contentStream.setFont(tableFont, 18);
                float scanWidth = tableFont.getStringWidth(scanText) / 1000 * 18;
                contentStream.beginText();
                contentStream.newLineAtOffset((pageWidth - scanWidth) / 2, qrY - 40);
                contentStream.showText(scanText);
                contentStream.endText();

                // Instructions
                String instruction1 = "1. Open your phone camera";
                String instruction2 = "2. Point at the QR code";
                String instruction3 = "3. Tap the notification to open menu";
                contentStream.setFont(infoFont, 12);

                float startY = qrY - 80;
                for (String instruction : new String[]{instruction1, instruction2, instruction3}) {
                    float instructionWidth = infoFont.getStringWidth(instruction) / 1000 * 12;
                    contentStream.beginText();
                    contentStream.newLineAtOffset((pageWidth - instructionWidth) / 2, startY);
                    contentStream.showText(instruction);
                    contentStream.endText();
                    startY -= 20;
                }
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }

    public byte[] generateAllTablesQrPdf(List<Table> tables, List<BufferedImage> qrImages) throws IOException {
        try (PDDocument document = new PDDocument()) {
            for (int i = 0; i < tables.size(); i++) {
                Table table = tables.get(i);
                BufferedImage qrImage = qrImages.get(i);

                PDPage page = new PDPage(PDRectangle.A4);
                document.addPage(page);

                float pageWidth = page.getMediaBox().getWidth();
                float pageHeight = page.getMediaBox().getHeight();

                try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                    // Restaurant Name
                    PDType1Font headerFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                    contentStream.setFont(headerFont, 24);
                    float headerWidth = headerFont.getStringWidth(restaurantName) / 1000 * 24;
                    contentStream.beginText();
                    contentStream.newLineAtOffset((pageWidth - headerWidth) / 2, pageHeight - 60);
                    contentStream.showText(restaurantName);
                    contentStream.endText();

                    // Table Number
                    String tableText = "Table " + table.getTableNumber();
                    contentStream.setFont(headerFont, 32);
                    float tableWidth = headerFont.getStringWidth(tableText) / 1000 * 32;
                    contentStream.beginText();
                    contentStream.newLineAtOffset((pageWidth - tableWidth) / 2, pageHeight - 110);
                    contentStream.showText(tableText);
                    contentStream.endText();

                    // QR Code
                    PDImageXObject pdImage = LosslessFactory.createFromImage(document, qrImage);
                    float qrSize = 220;
                    float qrX = (pageWidth - qrSize) / 2;
                    float qrY = (pageHeight - qrSize) / 2 - 30;
                    contentStream.drawImage(pdImage, qrX, qrY, qrSize, qrSize);

                    // Scan Text
                    String scanText = "Scan to View Menu";
                    PDType1Font textFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                    contentStream.setFont(textFont, 16);
                    float scanWidth = textFont.getStringWidth(scanText) / 1000 * 16;
                    contentStream.beginText();
                    contentStream.newLineAtOffset((pageWidth - scanWidth) / 2, qrY - 30);
                    contentStream.showText(scanText);
                    contentStream.endText();
                }
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }

}
