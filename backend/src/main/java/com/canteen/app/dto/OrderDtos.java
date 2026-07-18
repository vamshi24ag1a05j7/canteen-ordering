package com.canteen.app.dto;

import java.util.List;

public class OrderDtos {

    public static class OrderItemRequest {
        private Long menuItemId;
        private int quantity;

        public Long getMenuItemId() { return menuItemId; }
        public void setMenuItemId(Long menuItemId) { this.menuItemId = menuItemId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

    public static class CreateOrderRequest {
        private List<OrderItemRequest> items;
        private String pickupNote;

        public List<OrderItemRequest> getItems() { return items; }
        public void setItems(List<OrderItemRequest> items) { this.items = items; }
        public String getPickupNote() { return pickupNote; }
        public void setPickupNote(String pickupNote) { this.pickupNote = pickupNote; }
    }

    public static class PaymentRequest {
        private Long orderId;
        private String paymentMethod;

        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    }

    public static class StatusUpdateRequest {
        private String status;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
