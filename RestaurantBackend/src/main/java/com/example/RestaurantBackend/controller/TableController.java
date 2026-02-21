package com.example.RestaurantBackend.controller;

import com.example.RestaurantBackend.dto.request.table.CreateTableRequest;
import com.example.RestaurantBackend.dto.request.table.UpdateTableRequest;
import com.example.RestaurantBackend.dto.request.table.UpdateTableStatusRequest;
import com.example.RestaurantBackend.dto.response.MessageResponse;
import com.example.RestaurantBackend.dto.response.TableListResponse;
import com.example.RestaurantBackend.dto.response.TableResponse;
import com.example.RestaurantBackend.service.TableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/tables")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class TableController {

    private final TableService tableService;

    @PostMapping
    public ResponseEntity<MessageResponse> createTable(@Valid @RequestBody CreateTableRequest request) {
        MessageResponse response = tableService.createTable(request);

        if(!response.getSuccess())
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<TableListResponse> getAllTables(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String sortBy
    ) {
        TableListResponse response = tableService.getAllTables(status, location, sortBy);

        if(!response.getSuccess())
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTableById(@PathVariable UUID id) {
        TableResponse response = tableService.getTableById(id);

        if(response == null)
            return new ResponseEntity<>(MessageResponse.error("Table not found"), HttpStatus.NOT_FOUND);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageResponse> updateTable(@PathVariable UUID id,
                                                       @Valid @RequestBody UpdateTableRequest request) {
        MessageResponse response = tableService.updateTable(id, request);

        if(!response.getSuccess())
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

        return new ResponseEntity<>(response, HttpStatus.OK);

    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MessageResponse> updateTableStatus(@PathVariable UUID id,
                                                             @Valid @RequestBody UpdateTableStatusRequest request) {
        MessageResponse response = tableService.updateTableStatus(id, request);

        if(!response.getSuccess())
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteTable(@PathVariable UUID id) {
        MessageResponse response = tableService.deleteTable(id);

        if(!response.getSuccess())
            return new ResponseEntity<>(response, HttpStatus.NO_CONTENT);

        return new ResponseEntity<>(response, HttpStatus.NO_CONTENT);
    }
}
