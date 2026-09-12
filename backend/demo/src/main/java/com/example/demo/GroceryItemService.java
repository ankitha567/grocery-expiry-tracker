package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GroceryItemService {

    @Autowired
    private GroceryItemRepository repository;

    private static final double AVG_ITEM_WEIGHT_KG = 0.3;

    public List<GroceryItem> getAllItems(String householdId) {
        return repository.findByHouseholdIdAndStatus(householdId, "ACTIVE");
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

    public List<GroceryItem> getExpiringSoon(String householdId, int days) {
        return repository.findByHouseholdIdAndExpiryDateBefore(householdId, LocalDate.now().plusDays(days));
    }

    public GroceryItem markStatus(String id, String status) {
        GroceryItem item = repository.findById(id).orElseThrow();
        item.setStatus(status);
        return repository.save(item);
    }

    public Map<String, Object> getStats(String householdId) {
        List<GroceryItem> used = repository.findByHouseholdIdAndStatus(householdId, "USED");
        List<GroceryItem> wasted = repository.findByHouseholdIdAndStatus(householdId, "WASTED");

        Map<String, Object> stats = new HashMap<>();
        stats.put("usedCount", used.size());
        stats.put("wastedCount", wasted.size());
        stats.put("kgSaved", Math.round(used.size() * AVG_ITEM_WEIGHT_KG * 10.0) / 10.0);
        stats.put("kgWasted", Math.round(wasted.size() * AVG_ITEM_WEIGHT_KG * 10.0) / 10.0);
        return stats;
    }

    public List<Map<String, Object>> getShoppingList(String householdId) {
        List<GroceryItem> used = repository.findByHouseholdIdAndStatus(householdId, "USED");
        List<GroceryItem> wasted = repository.findByHouseholdIdAndStatus(householdId, "WASTED");

        List<GroceryItem> combined = new ArrayList<>();
        combined.addAll(used);
        combined.addAll(wasted);

        Map<String, List<GroceryItem>> grouped = combined.stream()
                .collect(Collectors.groupingBy(i -> i.getName().toLowerCase().trim()));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, List<GroceryItem>> entry : grouped.entrySet()) {
            List<GroceryItem> group = entry.getValue();
            GroceryItem latest = group.get(group.size() - 1);

            Map<String, Object> suggestion = new HashMap<>();
            suggestion.put("name", latest.getName());
            suggestion.put("category", latest.getCategory());
            suggestion.put("timesBought", group.size());
            suggestion.put("wastedBefore", group.stream().anyMatch(i -> "WASTED".equals(i.getStatus())));
            result.add(suggestion);
        }

        result.sort((a, b) -> (int) b.get("timesBought") - (int) a.get("timesBought"));
        return result;
    }
}