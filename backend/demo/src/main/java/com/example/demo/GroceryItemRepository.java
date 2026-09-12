package com.example.demo;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDate;
import java.util.List;

public interface GroceryItemRepository extends MongoRepository<GroceryItem, String> {
    List<GroceryItem> findByExpiryDateBefore(LocalDate date);
    List<GroceryItem> findByStatus(String status);
}