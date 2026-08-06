package com.example.minierp.product;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

class ProductServiceTest {

    private ProductRepository repository;
    private ProductService service;

    @BeforeEach
    void setUp() {
        repository = Mockito.mock(ProductRepository.class);
        service = new ProductService(repository);
    }

    @Test
    void findAllReturnsAllProducts() {
        Product first = new Product("P001", "商品A", new BigDecimal("100.00"), true);
        Product second = new Product("P002", "商品B", new BigDecimal("200.00"), false);
        when(repository.findAll()).thenReturn(List.of(first, second));

        List<ProductResponse> result = service.findAll();

        assertEquals(2, result.size());
        assertEquals("P001", result.get(0).productCode());
        assertEquals("P002", result.get(1).productCode());
    }

    @Test
    void findByIdThrowsWhenProductDoesNotExist() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        ProductNotFoundException exception = assertThrows(
                ProductNotFoundException.class,
                () -> service.findById(99L));

        assertEquals("Product not found: 99", exception.getMessage());
    }

    @Test
    void createSavesProductWhenCodeIsNotDuplicated() {
        ProductRequest request = new ProductRequest(
                "P001",
                "商品A",
                new BigDecimal("100.00"),
                true);
        when(repository.existsByProductCode("P001")).thenReturn(false);
        when(repository.save(any(Product.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse result = service.create(request);

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(repository).save(captor.capture());
        Product savedProduct = captor.getValue();

        assertEquals("P001", savedProduct.getProductCode());
        assertEquals("商品A", savedProduct.getName());
        assertEquals(new BigDecimal("100.00"), savedProduct.getUnitPrice());
        assertEquals("P001", result.productCode());
    }

    @Test
    void createThrowsWhenProductCodeIsDuplicated() {
        ProductRequest request = new ProductRequest(
                "P001",
                "商品A",
                new BigDecimal("100.00"),
                true);
        when(repository.existsByProductCode("P001")).thenReturn(true);

        assertThrows(
                DuplicateProductCodeException.class,
                () -> service.create(request));

        verify(repository, never()).save(any(Product.class));
    }
}


