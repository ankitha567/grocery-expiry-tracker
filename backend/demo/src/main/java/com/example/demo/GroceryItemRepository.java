package com.example.demo;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface GroceryItemRepository extends MongoRepository<GroceryItem, String> {
    List<GroceryItem> findByExpiryDateBefore(LocalDate date);
}