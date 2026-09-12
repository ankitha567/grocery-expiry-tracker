package com.example.demo;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class GroceryItemController {

    @Autowired
    private GroceryItemService service;

    @GetMapping
    public List<GroceryItem> getAll() {
        return service.getAllItems();
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
    public List<GroceryItem> expiringSoon(@RequestParam(defaultValue = "3") int days) {
        return service.getExpiringSoon(days);
    }
}