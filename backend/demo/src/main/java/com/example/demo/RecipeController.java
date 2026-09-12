package com.example.demo;


import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/recipes")
@CrossOrigin(origins = "*")
public class RecipeController {

    @Value("${spoonacular.api.key}")
    private String apiKey;

    private final GroceryItemRepository repository;
    private final RestTemplate restTemplate = new RestTemplate();

    public RecipeController(GroceryItemRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/suggestions")
    public String getSuggestions(@RequestParam(defaultValue = "5") int days) {
        List<GroceryItem> expiringItems = repository.findByExpiryDateBefore(LocalDate.now().plusDays(days));

        if (expiringItems.isEmpty()) {
            return "{\"message\": \"No expiring items to suggest recipes for.\"}";
        }

        String ingredients = expiringItems.stream()
                .map(GroceryItem::getName)
                .collect(Collectors.joining(","));

        String url = "https://api.spoonacular.com/recipes/findByIngredients"
                + "?ingredients=" + ingredients
                + "&number=6"
                + "&ranking=1"
                + "&apiKey=" + apiKey;

        return restTemplate.getForObject(url, String.class);
    }
}
