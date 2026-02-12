package com.example.RestaurantBackend.repo;

import com.example.RestaurantBackend.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MenuItemRepo extends JpaRepository<MenuItem, UUID> {

    boolean existsByName(String name);

}
