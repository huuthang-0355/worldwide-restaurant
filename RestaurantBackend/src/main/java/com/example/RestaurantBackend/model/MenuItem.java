package com.example.RestaurantBackend.model;

import com.example.RestaurantBackend.model.enums.MenuItemStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "menu_items")
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, columnDefinition = "VARCHAR(150)")
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "prep_time_minutes")
    private Integer prepTimeMinutes;

    @Enumerated(EnumType.STRING)
    private MenuItemStatus status;

    @Column(name = "is_chef_recommended")
    private Boolean isChefRecommended;

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;

     @Column(name = "popularity_score")
     @Min(value = 0)
     @Builder.Default
     private Integer popularityScore = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    private Category category;

    // mock getter for adding extra property in api
    @JsonProperty("categoryId")
    public UUID getCategoryId() {

        return this.category != null ? category.getId() : null;
    }

    @OneToMany(mappedBy = "menuItem", cascade = CascadeType.ALL, orphanRemoval = true)
    List<MenuItemPhoto> photos;

    @ManyToMany
            @JoinTable(
                    name = "menu_item_modifier_groups",
                    joinColumns = @JoinColumn(name = "menu_item_id"),
                    inverseJoinColumns = @JoinColumn(name = "group_id")
            )
    List<ModifierGroup> modifierGroups;
}
