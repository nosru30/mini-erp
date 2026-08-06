package com.example.minierp.salesorder;

public class SalesOrderNotDeletableException extends RuntimeException {

    public SalesOrderNotDeletableException(Long id, SalesOrderStatus status) {
        super("Sales order is not deletable: id=" + id + ", status=" + status);
    }
}
