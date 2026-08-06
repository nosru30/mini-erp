package com.example.minierp.customer;

public class CustomerNotFoundException extends RuntimeException {

    public CustomerNotFoundException(Long id) {
        super("Customer not found: " + id);
    }

    public CustomerNotFoundException(String customerCode) {
        super("Customer not found by code: " + customerCode);
    }
}
