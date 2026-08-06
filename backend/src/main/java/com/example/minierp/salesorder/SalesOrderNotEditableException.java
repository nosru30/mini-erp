package com.example.minierp.salesorder;

public class SalesOrderNotEditableException extends RuntimeException {

    public SalesOrderNotEditableException(Long id, SalesOrderStatus status) {
        super("Sales order is not editable: id=" + id + ", status=" + status);
    }
}
