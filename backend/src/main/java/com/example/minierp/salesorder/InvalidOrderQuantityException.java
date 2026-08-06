package com.example.minierp.salesorder;

public class InvalidOrderQuantityException extends RuntimeException {

    public InvalidOrderQuantityException(int quantity) {
        super("Order quantity must be at least 1: " + quantity);
    }
}
