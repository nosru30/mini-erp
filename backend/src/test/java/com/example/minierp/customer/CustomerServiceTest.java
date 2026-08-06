package com.example.minierp.customer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

class CustomerServiceTest {

    private CustomerRepository repository;
    private CustomerService service;

    @BeforeEach
    void setUp() {
        repository = Mockito.mock(CustomerRepository.class);
        service = new CustomerService(repository);
    }

    @Test
    void findAllReturnsAllCustomers() {
        Customer first = new Customer(
                "C001", "顧客A", "a@example.com", "03-1111-1111", true);
        Customer second = new Customer(
                "C002", "顧客B", null, null, false);
        when(repository.findAll()).thenReturn(List.of(first, second));

        List<CustomerResponse> result = service.findAll();

        assertEquals(2, result.size());
        assertEquals("C001", result.get(0).customerCode());
        assertEquals("C002", result.get(1).customerCode());
    }

    @Test
    void findByIdThrowsWhenCustomerDoesNotExist() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        CustomerNotFoundException exception = assertThrows(
                CustomerNotFoundException.class,
                () -> service.findById(99L));

        assertEquals("Customer not found: 99", exception.getMessage());
    }

    @Test
    void createSavesCustomerWhenCodeIsNotDuplicated() {
        CustomerRequest request = new CustomerRequest(
                "C001",
                "株式会社サンプル",
                "contact@example.com",
                "03-1234-5678",
                true);
        when(repository.existsByCustomerCode("C001")).thenReturn(false);
        when(repository.save(any(Customer.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CustomerResponse result = service.create(request);

        ArgumentCaptor<Customer> captor = ArgumentCaptor.forClass(Customer.class);
        verify(repository).save(captor.capture());
        Customer savedCustomer = captor.getValue();

        assertEquals("C001", savedCustomer.getCustomerCode());
        assertEquals("株式会社サンプル", savedCustomer.getName());
        assertEquals("contact@example.com", savedCustomer.getEmail());
        assertEquals("03-1234-5678", savedCustomer.getPhone());
        assertEquals("C001", result.customerCode());
    }

    @Test
    void createThrowsWhenCustomerCodeIsDuplicated() {
        CustomerRequest request = new CustomerRequest(
                "C001",
                "株式会社サンプル",
                null,
                null,
                true);
        when(repository.existsByCustomerCode("C001")).thenReturn(true);

        assertThrows(
                DuplicateCustomerCodeException.class,
                () -> service.create(request));

        verify(repository, never()).save(any(Customer.class));
    }
}


