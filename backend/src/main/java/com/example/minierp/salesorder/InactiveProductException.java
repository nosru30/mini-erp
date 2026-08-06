package com.example.minierp.salesorder;

public class InactiveProductException extends RuntimeException {

    public InactiveProductException(String productCode) {
        super("Product is inactive: " + productCode);
    }
}
