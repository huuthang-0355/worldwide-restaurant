package com.example.RestaurantBackend.service;

import com.example.RestaurantBackend.dto.request.table.CreateTableRequest;
import com.example.RestaurantBackend.dto.request.table.UpdateTableRequest;
import com.example.RestaurantBackend.dto.request.table.UpdateTableStatusRequest;
import com.example.RestaurantBackend.dto.response.*;
import com.example.RestaurantBackend.model.enums.DataStatus;
import com.example.RestaurantBackend.model.Table;
import com.example.RestaurantBackend.repo.TableRepo;
import com.google.zxing.WriterException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TableService {

    private final TableRepo tableRepo;
    private final QrTokenService qrTokenService;
    private final QrCodeService qrCodeService;
    private final PdfService pdfService;

    public MessageResponse createTable(CreateTableRequest request) {
        try {

            // check if table number already exists
            if(tableRepo.existsByTableNumber(request.getTableNumber().trim()))
                return MessageResponse.error("Table number " + request.getTableNumber() + " already exists");

            Table table = new Table();
            table.setTableNumber(request.getTableNumber());
            table.setCapacity(request.getCapacity());
            table.setLocation(request.getLocation() != null ? request.getLocation() : null);
            table.setDescription(request.getDescription());
            table.setStatus(DataStatus.ACTIVE);

            tableRepo.save(table);

            return MessageResponse.success("Table created successfully");

        }catch (Exception e) {

            return MessageResponse.error("Failed to create table: " + e.getMessage());
        }
    }

    public TableListResponse getAllTables(String status, String location, String sortBy) {
        try {
            List<Table> tables = new ArrayList<>();

            if(status != null && location != null) {

                DataStatus realStatus = DataStatus.valueOf(status.toUpperCase());
                tables = tableRepo.findByStatusAndLocation(realStatus, location);

            }else if(status != null) {

                DataStatus realStatus = DataStatus.valueOf(status.toUpperCase());
                tables = tableRepo.findByStatus(realStatus);
            }else if(location != null) {

                tables = tableRepo.findByLocation(location);
            } else { // sort by capacity, created, tablenumber
                if(sortBy != null) {
                    switch (sortBy.toLowerCase()) {
                        case "capacity":
                            tables = tableRepo.findAllByOrderByCapacityAsc();
                            break;
                        case "created":
                            tables = tableRepo.findAllByOrderByCreatedAtDesc();
                            break;
                        case "tablenumber":
                            tables = tableRepo.findAllByOrderByTableNumberAsc();
                        default:
                            break;
                    }
                } else tables = tableRepo.findAllByOrderByTableNumberAsc();

            }

            List<TableResponse> tableResponses = tables.stream()
                    .map(table -> TableResponse.fromEntity(table))
                    .toList();

            return TableListResponse.success(tableResponses);

        } catch (IllegalArgumentException e) {

            return TableListResponse.error("Invalid status value. Use ACTIVE or INACTIVE");
        } catch (Exception e) {

            return TableListResponse.error("Failed to retrieve tables: " + e.getMessage());
        }
    }

    public TableResponse getTableById(UUID id) {
        Optional<Table> optionalTable = tableRepo.findById(id);

        return optionalTable.map(table -> TableResponse.fromEntity(table)).orElse(null);
    }

    @Transactional
    public MessageResponse updateTable(UUID id, UpdateTableRequest request) {

        try {
            Optional<Table> optionalTable = tableRepo.findById(id);

            if(optionalTable.isEmpty())
                return MessageResponse.error("Table not found");

            Table table = optionalTable.get();

            // check if new table number conflicts with existing (excluding current)
            if(request.getTableNumber() != null
                    && !table.getTableNumber().equals(request.getTableNumber().trim()) &&
                    tableRepo.existsByTableNumberAndIdNot(request.getTableNumber().trim(), id)) {

                return MessageResponse.error("Table number " + request.getTableNumber() + " already exists");
            }

            if(request.getTableNumber() != null) table.setTableNumber(request.getTableNumber().trim());
            if(request.getDescription() != null) table.setDescription(request.getDescription());
            if(request.getLocation() != null) table.setLocation(request.getLocation());
            if(request.getCapacity() != null) table.setCapacity(request.getCapacity());

            tableRepo.save(table);

            return MessageResponse.success("Table updated successfully");

        }catch (Exception e) {

            return MessageResponse.error("Failed to update table: " + e.getMessage());
        }

    }

    @Transactional
    public MessageResponse updateTableStatus(UUID id, UpdateTableStatusRequest request) {
        try {
            Optional<Table> optionalTable = tableRepo.findById(id);

            if(optionalTable.isEmpty())
                return MessageResponse.error("Table not found");

            Table table = optionalTable.get();
            table.setStatus(request.getStatus());

            tableRepo.save(table);

            return MessageResponse.success("Table updated status successfully");

        }catch (Exception e) {

            return MessageResponse.error("Failed to update status table: " + e.getMessage());
        }
    }

    @Transactional
    public MessageResponse deleteTable(UUID id) {
        try {
            Optional<Table> optionalTable = tableRepo.findById(id);

            if(optionalTable.isEmpty())
                return MessageResponse.error("Table not found");

            Table table = optionalTable.get();

            // Soft deletion
            table.setStatus(DataStatus.INACTIVE);
            tableRepo.save(table);

            return MessageResponse.success("Table deleted successfully");

        }catch (Exception e) {

            return MessageResponse.error("Failed to delete table: " + e.getMessage());
        }
    }

    // ========= QR Code ===============
    @Transactional
    public QrCodeResponse generateQrCode(UUID tableId) {
        try {
            Optional<Table> optionalTable = tableRepo.findById(tableId);

            if(optionalTable.isEmpty())
                return QrCodeResponse.error("Table not found");

            Table table = optionalTable.get();

            if(table.getStatus() == DataStatus.INACTIVE)
                return QrCodeResponse.error("Cannot generate QR Code for inactive table");

            // generate new one (invalidates old one)
            String token = qrTokenService.generateTableToken(tableId, table.getTableNumber());
            LocalDateTime now = LocalDateTime.now();

            table.setQrToken(token);
            table.setQrTokenCreatedAt(now);
            tableRepo.save(table);

            String qrUrl = qrCodeService.generateQrUrl(token);

            return QrCodeResponse.success(tableId, table.getTableNumber(), qrUrl, now);

        }catch (Exception e) {

            return QrCodeResponse.error("Failed to generate QR Code: " + e.getMessage());
        }
    }

    @Transactional
    public QrCodeResponse regenerateQrCode(UUID tableId) {

        return this.generateQrCode(tableId);
    }

    public byte[] downloadQrCodePng(UUID tableId) throws IOException, WriterException {

        Optional<Table> optionalTable = tableRepo.findById(tableId);

        if(optionalTable.isEmpty())
            return null;

        Table table = optionalTable.get();

        if(table.getQrToken() == null || table.getQrToken().isEmpty())
            return null;

        String qrUrl = qrCodeService.generateQrUrl(table.getQrToken());

        return qrCodeService.generateQrCodeImage(qrUrl);

    }

    public byte[] downloadQrCodePdf(UUID tableId) throws WriterException, IOException {
        Optional<Table> optionalTable = tableRepo.findById(tableId);

        if(optionalTable.isEmpty())
            return null;

        Table table = optionalTable.get();

        if(table.getQrToken() == null || table.getQrToken().isEmpty())
            return null;

        String qrUrl = qrCodeService.generateQrUrl(table.getQrToken());

        BufferedImage qrImage = qrCodeService.generateQrCodeBufferedImage(qrUrl);

        return pdfService.generateTableQrPdf(table, qrImage);

    }

    public byte[] downloadAllQrCodesPdf() throws WriterException, IOException {
        List<Table> tables = tableRepo.findByStatusOrderByTableNumberAsc(DataStatus.ACTIVE);

        if(tables.isEmpty())
            return null;

        // generate qr codes only for table having token
        List<Table> tablesWithQr = new ArrayList<>();
        List<BufferedImage> qrImages = new ArrayList<>();

        for(Table table : tables) {
            if(table.getQrToken() != null && !table.getQrToken().isEmpty()) {

                String qrUrl = qrCodeService.generateQrUrl(table.getQrToken());
                BufferedImage qrImage = qrCodeService.generateQrCodeBufferedImage(qrUrl);

                tablesWithQr.add(table);
                qrImages.add(qrImage);

            }
        }

        if(tablesWithQr.isEmpty()) return null;

        return pdfService.generateAllTablesQrPdf(tablesWithQr, qrImages);
    }

    // ================== Menu Access (Public) ===========

    public MenuAccessResponse verifyQrToken(String token) {
        if(token == null || token.isEmpty())
            return MenuAccessResponse.invalid("No token provided");

        // validate token signature
        if(!qrTokenService.isValidateToken(token))
            return MenuAccessResponse.invalid("This QR code is no longer valid. Please ask staff for assistance");

        UUID tableId = qrTokenService.extractTableId(token);

        if(tableId == null) {
            return MenuAccessResponse.invalid("Invalid QR code format");
        }

        // check if token matches current table token
        Optional<Table> optionalTable = tableRepo.findById(tableId);

        if(optionalTable.isEmpty())
            return MenuAccessResponse.invalid("Table not found");

        Table table = optionalTable.get();

        // verify the token is the current one (not an old regenerated one)
        if(!token.equals(table.getQrToken()))
            return MenuAccessResponse.invalid("This QR code is no longer valid. Please ask staff for assistance");

        if(table.getStatus() == DataStatus.INACTIVE)
            return MenuAccessResponse.invalid("This table is currently not available");


        return MenuAccessResponse.valid(table.getId(),
                table.getTableNumber(),
                table.getCapacity(),
                table.getLocation());
    }
}
