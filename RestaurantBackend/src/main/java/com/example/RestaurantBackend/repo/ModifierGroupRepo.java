package com.example.RestaurantBackend.repo;

import com.example.RestaurantBackend.model.ModifierGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ModifierGroupRepo extends JpaRepository<ModifierGroup, UUID> {
}
