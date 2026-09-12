package com.example.demo;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface GroceryItemRepository extends MongoRepository<GroceryItem, String> {
    List<GroceryItem> findByExpiryDateBefore(LocalDate date);
    List<GroceryItem> findByStatus(String status);
    List<GroceryItem> findByHouseholdIdAndStatus(String householdId, String status);
    List<GroceryItem> findByHouseholdIdAndExpiryDateBefore(String householdId, LocalDate date);
}