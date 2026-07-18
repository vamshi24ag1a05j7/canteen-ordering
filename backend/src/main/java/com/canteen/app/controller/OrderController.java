package com.canteen.app.controller;

import com.canteen.app.dto.OrderDtos.*;
import com.canteen.app.model.*;
import com.canteen.app.repository.MenuItemRepository;
import com.canteen.app.repository.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderRepository orderRepo;
    private final MenuItemRepository menuRepo;

    public OrderController(OrderRepository orderRepo, MenuItemRepository menuRepo) {
        this.orderRepo = orderRepo;
        this.menuRepo = menuRepo;
    }

    @PostMapping("/orders")
    public ResponseEntity<?> placeOrder(@RequestBody CreateOrderRequest req, Authentication auth) {
        User user = (User) auth.getPrincipal();
        Order order = new Order();
        order.setCustomer(user);
        order.setPickupNote(req.getPickupNote());

        List<OrderItem> items = new ArrayList<>();
        double total = 0;
        for (OrderItemRequest ir : req.getItems()) {
            MenuItem mi = menuRepo.findById(ir.getMenuItemId()).orElseThrow();
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setMenuItem(mi);
            oi.setQuantity(ir.getQuantity());
            oi.setPriceAtOrderTime(mi.getPrice());
            total += mi.getPrice() * ir.getQuantity();
            items.add(oi);
        }
        order.setItems(items);
        order.setTotalAmount(total);
        return ResponseEntity.ok(orderRepo.save(order));
    }

    @GetMapping("/orders/my")
    public List<Order> myOrders(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return orderRepo.findByCustomerOrderByCreatedAtDesc(user);
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id, Authentication auth) {
        User user = (User) auth.getPrincipal();
        return orderRepo.findById(id)
                .filter(o -> o.getCustomer().getId().equals(user.getId()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/admin/orders")
    public List<Order> allOrders() {
        return orderRepo.findAll();
    }

    @PutMapping("/admin/orders/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest req) {
        return orderRepo.findById(id).map(order -> {
            order.setStatus(Order.Status.valueOf(req.getStatus()));
            return ResponseEntity.ok(orderRepo.save(order));
        }).orElse(ResponseEntity.notFound().build());
    }
}
