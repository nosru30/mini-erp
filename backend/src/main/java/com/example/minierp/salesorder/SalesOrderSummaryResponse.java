package com.example.minierp.salesorder;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SalesOrderSummaryResponse(
        Long id,
        String orderNumber,
        Long customerId,
        String customerCode,
        String customerName,
        LocalDate orderDate,
        SalesOrderStatus status,
        BigDecimal totalAmount) {

    public static SalesOrderSummaryResponse from(SalesOrder order) {
        return new SalesOrderSummaryResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getCustomer().getId(),
                order.getCustomer().getCustomerCode(),
                order.getCustomer().getName(),
                order.getOrderDate(),
                order.getStatus(),
                order.getTotalAmount());
    }
}
