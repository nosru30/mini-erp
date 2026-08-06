package com.example.minierp.salesorder;

public class EmptyOrderItemsException extends RuntimeException {

    public EmptyOrderItemsException() {
        super("Sales order must contain at least one item");
    }
}
