package com.example.minierp.salesorder;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class SalesOrderExceptionHandler {

    @ExceptionHandler(SalesOrderNotFoundException.class)
    ResponseEntity<Map<String, String>> notFound(
            SalesOrderNotFoundException exception) {
        return response(HttpStatus.NOT_FOUND, "SALES_ORDER_NOT_FOUND", exception);
    }

    @ExceptionHandler({
            SalesOrderNotEditableException.class,
            SalesOrderNotDeletableException.class,
            InvalidSalesOrderStatusException.class,
            InactiveCustomerException.class,
            InactiveProductException.class
    })
    ResponseEntity<Map<String, String>> conflict(RuntimeException exception) {
        return response(HttpStatus.CONFLICT, "SALES_ORDER_CONFLICT", exception);
    }

    @ExceptionHandler({
            EmptyOrderItemsException.class,
            InvalidOrderQuantityException.class
    })
    ResponseEntity<Map<String, String>> badRequest(RuntimeException exception) {
        return response(HttpStatus.BAD_REQUEST, "INVALID_SALES_ORDER", exception);
    }

    private ResponseEntity<Map<String, String>> response(
            HttpStatus status,
            String code,
            RuntimeException exception) {
        return ResponseEntity.status(status).body(Map.of(
                "code", code,
                "message", exception.getMessage()));
    }
}
