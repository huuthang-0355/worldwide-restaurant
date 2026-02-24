package com.example.RestaurantBackend.repo;

import com.example.RestaurantBackend.model.Category;
import com.example.RestaurantBackend.model.enums.DataStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepo extends JpaRepository<Category, UUID> {

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, UUID id);

    List<Category> findByStatusOrderByDisplayOrderAsc(DataStatus status);
}
