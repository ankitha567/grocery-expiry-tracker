package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class GroceryItemController {

    @Autowired
    private GroceryItemService service;

    @GetMapping
    public List<GroceryItem> getAll(@RequestParam String householdId) {
        return service.getAllItems(householdId);
    }

    @PostMapping
    public GroceryItem create(@RequestBody GroceryItem item) {
        return service.addItem(item);
    }

    @GetMapping("/{id}")
    public GroceryItem getOne(@PathVariable String id) {
        return service.getItemById(id);
    }

    @PutMapping("/{id}")
    public GroceryItem update(@PathVariable String id, @RequestBody GroceryItem item) {
        return service.updateItem(id, item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.deleteItem(id);
    }

    @GetMapping("/expiring")
    public List<GroceryItem> expiringSoon(@RequestParam String householdId, @RequestParam(defaultValue = "3") int days) {
        return service.getExpiringSoon(householdId, days);
    }

    @PatchMapping("/{id}/status")
    public GroceryItem markStatus(@PathVariable String id, @RequestParam String status) {
        return service.markStatus(id, status);
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats(@RequestParam String householdId) {
        return service.getStats(householdId);
    }

    @GetMapping("/shopping-list")
    public List<Map<String, Object>> getShoppingList(@RequestParam String householdId) {
        return service.getShoppingList(householdId);
    }
}