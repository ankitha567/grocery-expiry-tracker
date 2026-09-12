package com.example.demo;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GroceryItemService {

    @Autowired
    private GroceryItemRepository repository;

    public List<GroceryItem> getAllItems() {
        return repository.findAll();
    }

    public GroceryItem addItem(GroceryItem item) {
        return repository.save(item);
    }

    public GroceryItem getItemById(String id) {
        return repository.findById(id).orElseThrow();
    }

    public GroceryItem updateItem(String id, GroceryItem updated) {
        updated.setId(id);
        return repository.save(updated);
    }

    public void deleteItem(String id) {
        repository.deleteById(id);
    }

    public List<GroceryItem> getExpiringSoon(int days) {
        return repository.findByExpiryDateBefore(LocalDate.now().plusDays(days));
    }
}