package com.example.minierp.salesorder;

import java.math.BigDecimal;

import com.example.minierp.product.Product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "sales_order_items")
public class SalesOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sales_order_id", nullable = false)
    private SalesOrder salesOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "line_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal lineAmount;

    protected SalesOrderItem() {
    }

    public SalesOrderItem(Product product, int quantity) {
        if (quantity < 1) {
            throw new InvalidOrderQuantityException(quantity);
        }

        this.product = product;
        this.quantity = quantity;
        this.unitPrice = product.getUnitPrice();
        this.lineAmount = unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    void attachTo(SalesOrder salesOrder) {
        this.salesOrder = salesOrder;
    }

    public Long getId() {
        return id;
    }

    public Product getProduct() {
        return product;
    }

    public int getQuantity() {
        return quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public BigDecimal getLineAmount() {
        return lineAmount;
    }
}
