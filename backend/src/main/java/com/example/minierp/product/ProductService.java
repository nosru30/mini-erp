package com.example.minierp.product;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    public List<ProductResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(ProductResponse::from)
                .toList();
    }

    public ProductResponse findById(Long id) {
        return ProductResponse.from(findEntity(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        if (repository.existsByProductCode(request.productCode())) {
            throw new DuplicateProductCodeException(request.productCode());
        }

        Product product = new Product(
                request.productCode(),
                request.name(),
                request.unitPrice(),
                request.active());

        return ProductResponse.from(repository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findEntity(id);

        if (repository.existsByProductCodeAndIdNot(request.productCode(), id)) {
            throw new DuplicateProductCodeException(request.productCode());
        }

        product.update(
                request.productCode(),
                request.name(),
                request.unitPrice(),
                request.active());

        return ProductResponse.from(product);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(findEntity(id));
    }

    private Product findEntity(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }
}


