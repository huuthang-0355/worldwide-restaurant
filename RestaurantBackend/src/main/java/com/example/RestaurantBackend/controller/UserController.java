package com.example.RestaurantBackend.controller;

import com.example.RestaurantBackend.model.User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return new User();
    }
}
