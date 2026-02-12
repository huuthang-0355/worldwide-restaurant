package com.example.RestaurantBackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "category")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(name = "display_order")
    private int displayOrder;

    @Enumerated(EnumType.STRING)
    private DataStatus status;

    // cascade.all means when we delete category, all menu_items belonging that category is also deleted.
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    List<MenuItem> menuItems;


}
