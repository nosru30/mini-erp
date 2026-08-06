package com.example.minierp.salesorder;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {

    @EntityGraph(attributePaths = { "customer" })
    List<SalesOrder> findAllByOrderByOrderDateDescIdDesc();

    @Override
    @EntityGraph(attributePaths = { "customer", "items", "items.product" })
    Optional<SalesOrder> findById(Long id);
}
