package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GroceryItemService {

    public static void main(String[] args) {
        // This service is started by Spring Boot, not directly.
    }

    @Autowired
    private GroceryItemRepository repository;

    private static final double AVG_ITEM_WEIGHT_KG = 0.3; // rough estimate per item

    public List<GroceryItem> getAllItems() {
        return repository.findByStatus("ACTIVE");
    }

    public GroceryItem addItem(GroceryItem item) {
        item.setStatus("ACTIVE");
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

    public GroceryItem markStatus(String id, String status) {
        GroceryItem item = repository.findById(id).orElseThrow();
        item.setStatus(status);
        return repository.save(item);
    }

    public Map<String, Object> getStats() {
        List<GroceryItem> used = repository.findByStatus("USED");
        List<GroceryItem> wasted = repository.findByStatus("WASTED");

        Map<String, Object> stats = new HashMap<>();
        stats.put("usedCount", used.size());
        stats.put("wastedCount", wasted.size());
        stats.put("kgSaved", Math.round(used.size() * AVG_ITEM_WEIGHT_KG * 10.0) / 10.0);
        stats.put("kgWasted", Math.round(wasted.size() * AVG_ITEM_WEIGHT_KG * 10.0) / 10.0);
        return stats;
    }
}