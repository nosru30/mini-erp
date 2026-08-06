package com.example.minierp.salesorder;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.minierp.customer.Customer;
import com.example.minierp.customer.CustomerNotFoundException;
import com.example.minierp.customer.CustomerRepository;
import com.example.minierp.product.Product;
import com.example.minierp.product.ProductNotFoundException;
import com.example.minierp.product.ProductRepository;

@Service
@Transactional(readOnly = true)
public class SalesOrderService {

    private static final DateTimeFormatter ORDER_DATE_FORMAT =
            DateTimeFormatter.BASIC_ISO_DATE;

    private final SalesOrderRepository salesOrderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public SalesOrderService(
            SalesOrderRepository salesOrderRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository) {
        this.salesOrderRepository = salesOrderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    public List<SalesOrderSummaryResponse> findAll() {
        return salesOrderRepository.findAllByOrderByOrderDateDescIdDesc()
                .stream()
                .map(SalesOrderSummaryResponse::from)
                .toList();
    }

    public SalesOrderResponse findById(Long id) {
        return SalesOrderResponse.from(findEntity(id));
    }

    @Transactional
    public SalesOrderResponse create(SalesOrderRequest request) {
        Customer customer = findActiveCustomer(request.customerCode());
        List<SalesOrderItem> items = createItems(request.items());

        SalesOrder order = new SalesOrder(
                generateOrderNumber(request.orderDate()),
                customer,
                request.orderDate(),
                items);

        return SalesOrderResponse.from(salesOrderRepository.save(order));
    }

    @Transactional
    public SalesOrderResponse update(Long id, SalesOrderRequest request) {
        SalesOrder order = findEntity(id);
        order.ensureEditable();
        Customer customer = findActiveCustomer(request.customerCode());
        List<SalesOrderItem> items = createItems(request.items());

        order.update(customer, request.orderDate(), items);
        return SalesOrderResponse.from(order);
    }

    @Transactional
    public SalesOrderResponse confirm(Long id) {
        SalesOrder order = findEntity(id);
        order.confirm();
        return SalesOrderResponse.from(order);
    }

    @Transactional
    public SalesOrderResponse cancel(Long id) {
        SalesOrder order = findEntity(id);
        order.cancel();
        return SalesOrderResponse.from(order);
    }

    @Transactional
    public void delete(Long id) {
        SalesOrder order = findEntity(id);
        order.ensureDeletable();
        salesOrderRepository.delete(order);
    }

    private SalesOrder findEntity(Long id) {
        return salesOrderRepository.findById(id)
                .orElseThrow(() -> new SalesOrderNotFoundException(id));
    }

    private Customer findActiveCustomer(String customerCode) {
        Customer customer = customerRepository.findByCustomerCode(customerCode)
                .orElseThrow(() -> new CustomerNotFoundException(customerCode));

        if (!customer.isActive()) {
            throw new InactiveCustomerException(customerCode);
        }
        return customer;
    }

    private List<SalesOrderItem> createItems(
            List<SalesOrderItemRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw new EmptyOrderItemsException();
        }

        List<SalesOrderItem> items = new ArrayList<>();
        for (SalesOrderItemRequest request : requests) {
            Product product = productRepository
                    .findByProductCode(request.productCode())
                    .orElseThrow(() ->
                            new ProductNotFoundException(request.productCode()));

            if (!product.isActive()) {
                throw new InactiveProductException(request.productCode());
            }
            items.add(new SalesOrderItem(product, request.quantity()));
        }
        return items;
    }

    private String generateOrderNumber(LocalDate orderDate) {
        String suffix = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();
        return "SO-" + orderDate.format(ORDER_DATE_FORMAT) + "-" + suffix;
    }
}


