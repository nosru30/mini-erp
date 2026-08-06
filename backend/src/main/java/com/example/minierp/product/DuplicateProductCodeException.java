package com.example.minierp.product;

public class DuplicateProductCodeException extends RuntimeException {

    public DuplicateProductCodeException(String code) {
        super("Product code already exists: " + code);
    }
}
