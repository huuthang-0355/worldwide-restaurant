package com.example.RestaurantBackend.service;

import com.example.RestaurantBackend.model.MenuItem;
import com.example.RestaurantBackend.model.MenuItemPhoto;
import com.example.RestaurantBackend.repo.MenuItemPhotoRepo;
import com.example.RestaurantBackend.repo.MenuItemRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.lang.reflect.Array;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MenuItemPhotoService {

    private final MenuItemRepo menuItemRepo;
    private final CloudinaryService cloudinaryService;
    private final MenuItemPhotoRepo photoRepo;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private void validateFile(MultipartFile file) {
        if(file.isEmpty())
            throw new RuntimeException("File is empty");

        if(file.getSize() > MAX_FILE_SIZE)
            throw new RuntimeException("File size exceeds the limits of 5MB");

        String fileType = file.getContentType();
        if(fileType == null || !ALLOWED_CONTENT_TYPES.contains(fileType))
            throw new RuntimeException("Invalid file format. Only JPG, PNG, and WebP are allowed");
    }

    @Transactional // ensure the data integrity
    public MenuItemPhoto uploadPhoto(UUID menuItemId, MultipartFile file) {

        // validate file
        this.validateFile(file);

        // find menu item
        MenuItem item = menuItemRepo.findById(menuItemId)
                            .orElseThrow(() -> new RuntimeException("Menu item not found"));

        try {
            String url = cloudinaryService.uploadPhoto(file);

            // check if this photo is first photo -> if first -> set primary
            boolean isFirstImage = item.getPhotos().isEmpty();

            // create photo
            MenuItemPhoto photo = MenuItemPhoto.builder()
                    .url(url)
                    .isPrimary(isFirstImage)
                    .menuItem(item)
                    .build();

            return photoRepo.save(photo);
        } catch (IOException e) {
            throw new RuntimeException("Photo upload failed");
        }
    }

    @Transactional
    public void setPrimaryPhoto(UUID menuItemId, UUID photoId) {

        // find menuItem
        MenuItem item = menuItemRepo.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        // find photo needing setting
        MenuItemPhoto targetPhoto = photoRepo.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Photo not found"));

        // check if target photo actually belongs to menuItem passed.
        if(!targetPhoto.getMenuItem().getId().equals(menuItemId))
            throw new RuntimeException("Photo does not belong to this menu item");

        // set all other's primary attr into false
        for(MenuItemPhoto photo : item.getPhotos()) {
            photo.setIsPrimary(false);
//            photoRepo.save(photo); // not necessary, because JPA automatically track in Transactional
        }

        // set target photo into true
        targetPhoto.setIsPrimary(true);
        photoRepo.save(targetPhoto);
    }

    @Transactional // make sure removing image in db and setting primary taken place together.
    public void deletePhoto(UUID menuItemId, UUID photoId) {
        // 1. find photo to delete
        MenuItemPhoto deletedImage = photoRepo.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        MenuItem menuItem = menuItemRepo.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        // 2. remove image from cloudinary
        try {
            cloudinaryService.deletePhoto(deletedImage.getUrl());
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete image from cloud: " + e.getMessage());
        }

        // 3. set primary for another image, if deleted image is primary
        if(deletedImage.getIsPrimary()) {
            List<MenuItemPhoto> photos = menuItem.getPhotos();

            Optional<MenuItemPhoto> newPrimaryCandidate = photos.stream()
                    .filter(img -> !img.getId().equals(photoId))
                    .findFirst();

            if(newPrimaryCandidate.isPresent()) {
                MenuItemPhoto nextPrimaryPhoto = newPrimaryCandidate.get();
                nextPrimaryPhoto.setIsPrimary(true);
                photoRepo.save(nextPrimaryPhoto);
            }
        }

        // 4. remove from db
        menuItem.getPhotos().remove(deletedImage);
        photoRepo.delete(deletedImage);
    }
}
