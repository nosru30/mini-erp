package com.example.minierp.salesorder;

public class InactiveCustomerException extends RuntimeException {

    public InactiveCustomerException(String customerCode) {
        super("Customer is inactive: " + customerCode);
    }
}
