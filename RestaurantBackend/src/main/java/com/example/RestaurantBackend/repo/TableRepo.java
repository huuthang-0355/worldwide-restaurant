package com.example.RestaurantBackend.repo;

import com.example.RestaurantBackend.model.DataStatus;
import com.example.RestaurantBackend.model.Table;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TableRepo extends JpaRepository<Table, UUID> {

    boolean existsByTableNumber(String tableNumber);

    boolean existsByTableNumberAndIdNot(String tableNumber, UUID id);

    Optional<Table> findByTableNumber(String tableNumber);

    Optional<Table> findByQrToken(String qrToken);

    List<Table> findByStatus(DataStatus status);

    List<Table> findByLocation(String location);

    List<Table> findByStatusAndLocation(DataStatus status, String location);

    List<Table> findAllByOrderByTableNumberAsc();

    List<Table> findAllByOrderByCapacityAsc();

    List<Table> findAllByOrderByCreatedAtDesc();

    List<Table> findByStatusOrderByTableNumberAsc(DataStatus status);

}
