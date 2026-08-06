package com.example.minierp.salesorder;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/sales-orders")
@Tag(name = "Sales Orders", description = "受注の登録・取得・更新・確定・キャンセル・削除")
public class SalesOrderController {

    private final SalesOrderService service;

    public SalesOrderController(SalesOrderService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "受注一覧を取得する")
    public List<SalesOrderSummaryResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "受注と明細を取得する")
    @ApiResponse(responseCode = "404", description = "受注が存在しない")
    public SalesOrderResponse findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @Operation(summary = "下書き受注を登録する")
    @ApiResponse(responseCode = "201", description = "登録成功")
    @ApiResponse(responseCode = "400", description = "入力値が不正")
    @ApiResponse(responseCode = "404", description = "顧客または商品が存在しない")
    @ApiResponse(responseCode = "409", description = "顧客または商品が無効")
    public ResponseEntity<SalesOrderResponse> create(
            @Valid @RequestBody SalesOrderRequest request) {
        SalesOrderResponse created = service.create(request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "下書き受注を更新する")
    public SalesOrderResponse update(
            @PathVariable Long id,
            @Valid @RequestBody SalesOrderRequest request) {
        return service.update(id, request);
    }

    @PostMapping("/{id}/confirm")
    @Operation(summary = "下書き受注を確定する")
    public SalesOrderResponse confirm(@PathVariable Long id) {
        return service.confirm(id);
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "受注をキャンセルする")
    public SalesOrderResponse cancel(@PathVariable Long id) {
        return service.cancel(id);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "下書き受注を削除する")
    @ApiResponse(responseCode = "204", description = "削除成功")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
