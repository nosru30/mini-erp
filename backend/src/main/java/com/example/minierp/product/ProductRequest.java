package com.example.minierp.product;

import java.math.BigDecimal;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "商品の登録・更新内容")
public record ProductRequest(
        @Schema(description = "商品コード", example = "P001")
        @NotBlank @Size(max = 50)
        String productCode,

        @Schema(description = "商品名", example = "サンプル商品")
        @NotBlank @Size(max = 255)
        String name,

        @Schema(description = "単価", example = "1200.00")
        @NotNull @DecimalMin("0.00") @Digits(integer = 10, fraction = 2)
        BigDecimal unitPrice,

        @Schema(description = "有効状態", example = "true")
        @NotNull
        Boolean active) {
}
