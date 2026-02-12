package com.example.RestaurantBackend.repo;

import com.example.RestaurantBackend.model.ModifierOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ModifierOptionRepo extends JpaRepository<ModifierOption, UUID> {
}
