package com.example.demo;


import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/{barcode}")
    public String getProduct(@PathVariable String barcode) {
        String url = "https://world.openfoodfacts.org/api/v2/product/" + barcode + ".json";
        return restTemplate.getForObject(url, String.class);
    }
}