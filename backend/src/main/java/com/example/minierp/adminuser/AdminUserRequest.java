package com.example.minierp.adminuser;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Cognitoユーザーの作成内容")
public record AdminUserRequest(
        @Schema(description = "メールアドレス", example = "user@example.com")
        @NotBlank @Email @Size(max = 320)
        String email,

        @Schema(description = "表示名", example = "山田 太郎")
        @NotBlank @Size(max = 256)
        String name) {
}
