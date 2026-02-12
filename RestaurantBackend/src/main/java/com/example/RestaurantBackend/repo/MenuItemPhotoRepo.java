package com.example.RestaurantBackend.repo;

import com.example.RestaurantBackend.model.MenuItemPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MenuItemPhotoRepo extends JpaRepository<MenuItemPhoto, UUID> {
}
