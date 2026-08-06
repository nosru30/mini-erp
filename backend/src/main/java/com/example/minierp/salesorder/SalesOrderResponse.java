package com.example.minierp.salesorder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record SalesOrderResponse(
        Long id,
        String orderNumber,
        Long customerId,
        String customerCode,
        String customerName,
        LocalDate orderDate,
        SalesOrderStatus status,
        BigDecimal totalAmount,
        List<SalesOrderItemResponse> items,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {

    public static SalesOrderResponse from(SalesOrder order) {
        List<SalesOrderItemResponse> items = order.getItems()
                .stream()
                .map(SalesOrderItemResponse::from)
                .toList();

        return new SalesOrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getCustomer().getId(),
                order.getCustomer().getCustomerCode(),
                order.getCustomer().getName(),
                order.getOrderDate(),
                order.getStatus(),
                order.getTotalAmount(),
                items,
                order.getCreatedAt(),
                order.getUpdatedAt());
    }
}
