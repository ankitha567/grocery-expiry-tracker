package com.example.demo;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "items")
public class GroceryItem {
    @Id
    private String id;
    private String name;
    private String category;
    private LocalDate purchaseDate;
    private LocalDate expiryDate;
    private String imageUrl;
    private String barcode;
    private String status = "ACTIVE"; // ACTIVE, USED, WASTED
    private String householdId; // NEW - groups items by household
}