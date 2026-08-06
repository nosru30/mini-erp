package com.example.minierp.product;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ProductResponse(
        Long id,
        String productCode,
        String name,
        BigDecimal unitPrice,
        boolean active,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {

    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getProductCode(),
                product.getName(),
                product.getUnitPrice(),
                product.isActive(),
                product.getCreatedAt(),
                product.getUpdatedAt());
    }
}
