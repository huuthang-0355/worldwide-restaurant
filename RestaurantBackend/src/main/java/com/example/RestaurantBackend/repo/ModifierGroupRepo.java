package com.example.RestaurantBackend.repo;

import com.example.RestaurantBackend.model.ModifierGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ModifierGroupRepo extends JpaRepository<ModifierGroup, UUID> {

	@Query("""
			SELECT DISTINCT mg FROM ModifierGroup mg
			LEFT JOIN FETCH mg.options
			WHERE mg.id IN :ids
			""")
	List<ModifierGroup> findWithOptionsByIds(@Param("ids") List<UUID> ids);
}
