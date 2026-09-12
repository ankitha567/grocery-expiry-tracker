package com.example.demo;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

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
}