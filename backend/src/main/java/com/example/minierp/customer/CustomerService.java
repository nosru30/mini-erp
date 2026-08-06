package com.example.minierp.customer;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CustomerService {

    private final CustomerRepository repository;

    public CustomerService(CustomerRepository repository) {
        this.repository = repository;
    }

    public List<CustomerResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(CustomerResponse::from)
                .toList();
    }

    public CustomerResponse findById(Long id) {
        return CustomerResponse.from(findEntity(id));
    }

    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        if (repository.existsByCustomerCode(request.customerCode())) {
            throw new DuplicateCustomerCodeException(request.customerCode());
        }

        Customer customer = new Customer(
                request.customerCode(),
                request.name(),
                request.email(),
                request.phone(),
                request.active());

        return CustomerResponse.from(repository.save(customer));
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = findEntity(id);

        if (repository.existsByCustomerCodeAndIdNot(request.customerCode(), id)) {
            throw new DuplicateCustomerCodeException(request.customerCode());
        }

        customer.update(
                request.customerCode(),
                request.name(),
                request.email(),
                request.phone(),
                request.active());

        return CustomerResponse.from(customer);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(findEntity(id));
    }

    private Customer findEntity(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));
    }
}


