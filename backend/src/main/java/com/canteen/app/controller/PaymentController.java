package com.canteen.app.controller;

import com.canteen.app.dto.OrderDtos.PaymentRequest;
import com.canteen.app.model.Order;
import com.canteen.app.repository.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final OrderRepository orderRepo;

    public PaymentController(OrderRepository orderRepo) {
        this.orderRepo = orderRepo;
    }

    @PostMapping("/pay")
    public ResponseEntity<?> pay(@RequestBody PaymentRequest req) {
        return orderRepo.findById(req.getOrderId()).map(order -> {
            order.setPaymentStatus(Order.PaymentStatus.PAID);
            order.setPaymentMethod(req.getPaymentMethod());
            order.setTransactionRef("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            return ResponseEntity.ok(orderRepo.save(order));
        }).orElse(ResponseEntity.notFound().build());
    }
}
