package com.example.minierp.product;

public class ProductNotFoundException extends RuntimeException {

    public ProductNotFoundException(Long id) {
        super("Product not found: " + id);
    }

    public ProductNotFoundException(String productCode) {
        super("Product not found by code: " + productCode);
    }
}
