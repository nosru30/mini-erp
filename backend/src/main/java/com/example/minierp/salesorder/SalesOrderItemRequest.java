package com.example.minierp.salesorder;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "受注明細の入力内容")
public record SalesOrderItemRequest(
        @Schema(description = "商品コード", example = "P001")
        @NotBlank @Size(max = 50)
        String productCode,

        @Schema(description = "数量", example = "2")
        @Min(1)
        int quantity) {
}
