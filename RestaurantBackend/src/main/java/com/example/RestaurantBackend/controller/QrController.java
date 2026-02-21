package com.example.RestaurantBackend.controller;


import com.example.RestaurantBackend.dto.response.GuestMenuResponse;
import com.example.RestaurantBackend.dto.response.MenuAccessResponse;
import com.example.RestaurantBackend.dto.response.MessageResponse;
import com.example.RestaurantBackend.dto.response.QrCodeResponse;
import com.example.RestaurantBackend.service.GuestMenuService;
import com.example.RestaurantBackend.service.TableService;
import com.google.zxing.WriterException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class QrController {

    private final TableService tableService;
    private final GuestMenuService guestMenuService;

    @PostMapping("/admin/tables/{id}/qr/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QrCodeResponse> generateQrCode(@PathVariable UUID id) {
        QrCodeResponse response = tableService.generateQrCode(id);

        if(!response.getSuccess())
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

        return new ResponseEntity<>(response, HttpStatus.OK);

    }

    @PostMapping("/admin/tables/{id}/qr/regenerate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QrCodeResponse> regenerateQrCode(@PathVariable UUID id) {
        QrCodeResponse response = tableService.regenerateQrCode(id);

        if(!response.getSuccess())
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    //  GET /api/admin/tables/{id}/qr/download?format=png|pdf
    @GetMapping("/admin/tables/{id}/qr/download")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> downloadQrCode(@PathVariable UUID id,
                                            @RequestParam(defaultValue = "png") String format) {
        try {
            byte[] fileContent;
            String contentType;
            String filename;

            // check format
            if("pdf".equalsIgnoreCase(format)) {
                fileContent = tableService.downloadQrCodePdf(id);
                contentType = MediaType.APPLICATION_PDF_VALUE;
                filename = "table-qr-" + id + ".pdf";
            }else {
                fileContent = tableService.downloadQrCodePng(id);
                contentType = MediaType.IMAGE_PNG_VALUE;
                filename = "table-qr-" + id + ".png";
            }

            if(fileContent == null) {
                return new ResponseEntity<>(MessageResponse.error("QR code not found. Please generate one first."),
                        HttpStatus.NOT_FOUND);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());
            headers.setContentLength(fileContent.length);

            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);

        }catch (WriterException | IOException e) {

            return new ResponseEntity<>(MessageResponse.error("Failed to generate QR code: " + e.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/admin/tables/qr/download-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> downloadAllQrCodes() {
        try {
            byte[] pdfContent = tableService.downloadAllQrCodesPdf();

            if(pdfContent == null)
                return new ResponseEntity<>(MessageResponse.error("No QR codes found. Please generate QR codes for table first"),
                        HttpStatus.NOT_FOUND);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.attachment().filename("all-tables-qr.pdf").build());
            headers.setContentLength(pdfContent.length);

            return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);

        } catch (IOException | WriterException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(MessageResponse.error("Failed to generate PDF: " + e.getMessage()));

        }
    }

    // GET /api/menu?token={qrToken}
    @GetMapping("/menu")
    // verify qr token and return table info for menu access
    public ResponseEntity<MenuAccessResponse> verifyQrAndAccessMenu(@RequestParam String token) {
        MenuAccessResponse response = tableService.verifyQrToken(token);

        if(!response.getValid())
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // ==================== Public: Guest Menu Browsing ====================
    // GET /api/menu/items?token=xxx&query=burger&categoryId=xxx&sort=popularity&chefRecommended=true&page=1&limit=10
    @GetMapping("/menu/items")
    public ResponseEntity<GuestMenuResponse> getGuestMenu(
            @RequestParam String token,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false, defaultValue = "name_asc") String sort,
            @RequestParam(required = false) Boolean chefRecommended,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "10") int limit
    ) {

        GuestMenuResponse response = guestMenuService.getMenu(
                token, query, categoryId, sort, chefRecommended, page, limit
        );

        if(!response.getSuccess())
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

}
