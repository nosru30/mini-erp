package com.example.minierp.adminuser;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/admin/users")
@Tag(name = "Admin users", description = "Cognitoユーザーの管理")
@Validated
public class AdminUserController {

    private final AdminUserService service;

    public AdminUserController(AdminUserService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "ユーザー一覧を取得する")
    public AdminUserPage findAll(
            @RequestParam(defaultValue = "60") @Min(1) @Max(60) int limit,
            @RequestParam(required = false) String nextToken) {
        return service.findAll(limit, nextToken);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "一時パスワード付きユーザーを作成する")
    @ApiResponse(responseCode = "201", description = "作成成功")
    @ApiResponse(responseCode = "409", description = "メールアドレスが登録済み")
    public AdminUserResponse create(@Valid @RequestBody AdminUserRequest request) {
        return service.create(request);
    }
}
