package com.example.minierp.customer;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "顧客の登録・更新内容")
public record CustomerRequest(
        @Schema(description = "顧客コード", example = "C001")
        @NotBlank @Size(max = 50)
        String customerCode,

        @Schema(description = "顧客名", example = "株式会社サンプル")
        @NotBlank @Size(max = 255)
        String name,

        @Schema(description = "メールアドレス", example = "contact@example.com")
        @Email @Size(max = 255)
        String email,

        @Schema(description = "電話番号", example = "03-1234-5678")
        @Size(max = 30)
        String phone,

        @Schema(description = "有効状態", example = "true")
        @NotNull
        Boolean active) {
}
