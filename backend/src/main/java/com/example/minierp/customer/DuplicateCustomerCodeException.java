package com.example.minierp.customer;

public class DuplicateCustomerCodeException extends RuntimeException {

    public DuplicateCustomerCodeException(String customerCode) {
        super("Customer code already exists: " + customerCode);
    }
}
