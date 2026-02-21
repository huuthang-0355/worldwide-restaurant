package com.example.RestaurantBackend.repo;

import com.example.RestaurantBackend.model.DataStatus;
import com.example.RestaurantBackend.model.MenuItem;
import com.example.RestaurantBackend.model.MenuItemStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MenuItemRepo extends JpaRepository<MenuItem, UUID> {

    boolean existsByName(String name);


    /**
     * Query 1: Paginated IDs only (no collection fetching)
     */
    @Query("""
            SELECT m FROM MenuItem m
            JOIN m.category c
            WHERE c.status = :dataStatus
              AND (:query IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')))
              AND (:categoryId IS NULL OR c.id = :categoryId)
              AND (:chefRecommended IS NULL OR m.isChefRecommended = :chefRecommended)
            """)
    Page<MenuItem> findGuestMenuItems(
            @Param("dataStatus") DataStatus dataStatus,
            @Param("query") String query,
            @Param("categoryId") UUID categoryId,
            @Param("chefRecommended") Boolean chefRecommended,
            Pageable pageable
    );

    /**
     * Query 2: Fetch full entities with all collections by IDs
     */
    @Query("""
            SELECT DISTINCT m FROM MenuItem m
            JOIN FETCH m.category c
            LEFT JOIN FETCH m.photos
            WHERE m.id IN :ids
            """)
    List<MenuItem> findWithPhotosByIds(@Param("ids") List<UUID> ids);

    @Query("""
            SELECT DISTINCT m FROM MenuItem m
            LEFT JOIN FETCH m.modifierGroups mg
            WHERE m.id IN :ids
            """)
    List<MenuItem> findWithModifiersByIds(@Param("ids") List<UUID> ids);
}
