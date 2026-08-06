package com.example.minierp.salesorder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.example.minierp.customer.Customer;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "sales_orders")
public class SalesOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SalesOrderStatus status;

    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount;

    @OneToMany(
            mappedBy = "salesOrder",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<SalesOrderItem> items = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected SalesOrder() {
    }

    public SalesOrder(
            String orderNumber,
            Customer customer,
            LocalDate orderDate,
            List<SalesOrderItem> items) {
        this.orderNumber = orderNumber;
        this.customer = customer;
        this.orderDate = orderDate;
        this.status = SalesOrderStatus.DRAFT;
        replaceItems(items);
    }

    public void update(
            Customer customer,
            LocalDate orderDate,
            List<SalesOrderItem> items) {
        if (status != SalesOrderStatus.DRAFT) {
            throw new SalesOrderNotEditableException(id, status);
        }

        this.customer = customer;
        this.orderDate = orderDate;
        replaceItems(items);
    }

    public void ensureEditable() {
        if (status != SalesOrderStatus.DRAFT) {
            throw new SalesOrderNotEditableException(id, status);
        }
    }

    public void confirm() {
        if (status != SalesOrderStatus.DRAFT) {
            throw new InvalidSalesOrderStatusException(id, status, "confirm");
        }
        if (items.isEmpty()) {
            throw new EmptyOrderItemsException();
        }

        status = SalesOrderStatus.CONFIRMED;
    }

    public void cancel() {
        if (status == SalesOrderStatus.CANCELLED) {
            throw new InvalidSalesOrderStatusException(id, status, "cancel");
        }

        status = SalesOrderStatus.CANCELLED;
    }

    public void ensureDeletable() {
        if (status != SalesOrderStatus.DRAFT) {
            throw new SalesOrderNotDeletableException(id, status);
        }
    }

    private void replaceItems(List<SalesOrderItem> newItems) {
        if (newItems == null || newItems.isEmpty()) {
            throw new EmptyOrderItemsException();
        }

        items.clear();
        for (SalesOrderItem item : newItems) {
            item.attachTo(this);
            items.add(item);
        }
        recalculateTotalAmount();
    }

    private void recalculateTotalAmount() {
        totalAmount = items.stream()
                .map(SalesOrderItem::getLineAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @PrePersist
    void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public Customer getCustomer() {
        return customer;
    }

    public LocalDate getOrderDate() {
        return orderDate;
    }

    public SalesOrderStatus getStatus() {
        return status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public List<SalesOrderItem> getItems() {
        return Collections.unmodifiableList(items);
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}

