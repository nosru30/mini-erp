package com.example.minierp.salesorder;

public class InvalidSalesOrderStatusException extends RuntimeException {

    public InvalidSalesOrderStatusException(
            Long id,
            SalesOrderStatus status,
            String operation) {
        super("Cannot " + operation + " sales order: id=" + id + ", status=" + status);
    }
}
