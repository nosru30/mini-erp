package com.example.minierp.salesorder;

import java.time.LocalDate;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "受注の登録・更新内容")
public record SalesOrderRequest(
        @Schema(description = "顧客コード", example = "C001")
        @NotBlank @Size(max = 50)
        String customerCode,

        @Schema(description = "受注日", example = "2026-07-24")
        @NotNull
        LocalDate orderDate,

        @Schema(description = "受注明細")
        @NotEmpty
        List<@Valid SalesOrderItemRequest> items) {
}
