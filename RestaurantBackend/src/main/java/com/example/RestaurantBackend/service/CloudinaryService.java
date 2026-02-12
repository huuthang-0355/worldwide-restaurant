package com.example.RestaurantBackend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadPhoto(MultipartFile file) throws IOException {
        // check empty
        if(file.isEmpty())
            throw new RuntimeException("Empty file");

        // upload to cloudinary
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap("resource_type", "image", "folder", "smart-restaurant"));

        return uploadResult.get("secure_url").toString();
    }

    public void deletePhoto(String imageUrl) throws IOException {

        // 1. get publicID
        String publicId = getPublicIdFromUrl(imageUrl);

        // 2. call destroy api of cloudinary
        if(publicId != null) {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        }
    }


    // sample url: https://res.cloudinary.com/.../upload/v123456/smart-restaurant/abc.jpg
    // publicID: smart-restaurant/abc
    private String getPublicIdFromUrl(String imageUrl) {
        try {
            int uploadIndex = imageUrl.indexOf("/upload/");
            if(uploadIndex == -1) return null;

            // slice part behind upload
            String path = imageUrl.substring(uploadIndex + 8);

            // if it has version 'v1233', remove it.
            if(path.startsWith("v")) {
                int slashIndex = path.indexOf("/");
                if(slashIndex != -1) {
                    path = path.substring(slashIndex + 1);
                }
            }

            // remove extend file . (.jpg, .png,...)
            int dotIndex = path.indexOf(".");
            if(dotIndex != -1)
                return path.substring(0, dotIndex);


            return path;
        }catch (Exception e) {

            return null;
        }
    }

}
