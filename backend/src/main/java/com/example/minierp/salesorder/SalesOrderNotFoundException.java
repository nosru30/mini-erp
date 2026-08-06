package com.example.minierp.salesorder;

public class SalesOrderNotFoundException extends RuntimeException {

    public SalesOrderNotFoundException(Long id) {
        super("Sales order not found: " + id);
    }
}
