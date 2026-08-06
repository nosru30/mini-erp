package com.example.minierp.salesorder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.example.minierp.customer.Customer;
import com.example.minierp.customer.CustomerRepository;
import com.example.minierp.product.Product;
import com.example.minierp.product.ProductRepository;

class SalesOrderServiceTest {

    private SalesOrderRepository salesOrderRepository;
    private CustomerRepository customerRepository;
    private ProductRepository productRepository;
    private SalesOrderService service;

    @BeforeEach
    void setUp() {
        salesOrderRepository = Mockito.mock(SalesOrderRepository.class);
        customerRepository = Mockito.mock(CustomerRepository.class);
        productRepository = Mockito.mock(ProductRepository.class);
        service = new SalesOrderService(
                salesOrderRepository,
                customerRepository,
                productRepository);
    }

    @Test
    void createCalculatesAmountsAndSavesDraftOrder() {
        Customer customer = activeCustomer();
        Product product = activeProduct();
        SalesOrderRequest request = request(3);
        when(customerRepository.findByCustomerCode("C001"))
                .thenReturn(Optional.of(customer));
        when(productRepository.findByProductCode("P001"))
                .thenReturn(Optional.of(product));
        when(salesOrderRepository.save(any(SalesOrder.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SalesOrderResponse result = service.create(request);

        assertEquals(SalesOrderStatus.DRAFT, result.status());
        assertEquals(new BigDecimal("300.00"), result.totalAmount());
        assertEquals(1, result.items().size());
        assertEquals(new BigDecimal("100.00"), result.items().get(0).unitPrice());
        assertEquals(new BigDecimal("300.00"), result.items().get(0).lineAmount());
        verify(salesOrderRepository).save(any(SalesOrder.class));
    }

    @Test
    void createThrowsWhenCustomerIsInactive() {
        Customer customer = new Customer(
                "C001", "顧客A", null, null, false);
        when(customerRepository.findByCustomerCode("C001"))
                .thenReturn(Optional.of(customer));

        assertThrows(
                InactiveCustomerException.class,
                () -> service.create(request(1)));

        verify(salesOrderRepository, never()).save(any(SalesOrder.class));
    }

    @Test
    void createThrowsWhenProductIsInactive() {
        Product product = new Product(
                "P001", "商品A", new BigDecimal("100.00"), false);
        when(customerRepository.findByCustomerCode("C001"))
                .thenReturn(Optional.of(activeCustomer()));
        when(productRepository.findByProductCode("P001"))
                .thenReturn(Optional.of(product));

        assertThrows(
                InactiveProductException.class,
                () -> service.create(request(1)));

        verify(salesOrderRepository, never()).save(any(SalesOrder.class));
    }

    @Test
    void confirmChangesDraftOrderToConfirmed() {
        SalesOrder order = draftOrder();
        when(salesOrderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        SalesOrderResponse result = service.confirm(1L);

        assertEquals(SalesOrderStatus.CONFIRMED, result.status());
    }

    @Test
    void updateThrowsBeforeLookingUpMasterDataWhenOrderIsConfirmed() {
        SalesOrder order = draftOrder();
        order.confirm();
        when(salesOrderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        assertThrows(
                SalesOrderNotEditableException.class,
                () -> service.update(1L, request(1)));

        verify(customerRepository, never()).findByCustomerCode(any());
        verify(productRepository, never()).findByProductCode(any());
    }

    @Test
    void deleteThrowsWhenOrderIsConfirmed() {
        SalesOrder order = draftOrder();
        order.confirm();
        when(salesOrderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        assertThrows(
                SalesOrderNotDeletableException.class,
                () -> service.delete(1L));

        verify(salesOrderRepository, never()).delete(any(SalesOrder.class));
    }

    private SalesOrderRequest request(int quantity) {
        return new SalesOrderRequest(
                "C001",
                LocalDate.of(2026, 7, 24),
                List.of(new SalesOrderItemRequest("P001", quantity)));
    }

    private SalesOrder draftOrder() {
        return new SalesOrder(
                "SO-20260724-TEST0001",
                activeCustomer(),
                LocalDate.of(2026, 7, 24),
                List.of(new SalesOrderItem(activeProduct(), 1)));
    }

    private Customer activeCustomer() {
        return new Customer(
                "C001", "顧客A", "a@example.com", "03-1111-1111", true);
    }

    private Product activeProduct() {
        return new Product(
                "P001", "商品A", new BigDecimal("100.00"), true);
    }
}
