package com.canteen.app.controller;

import com.canteen.app.model.MenuItem;
import com.canteen.app.repository.MenuItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MenuController {

    private final MenuItemRepository menuRepo;

    public MenuController(MenuItemRepository menuRepo) {
        this.menuRepo = menuRepo;
    }

    @GetMapping("/menu")
    public List<MenuItem> getMenu() {
        return menuRepo.findAll();
    }

    @PostMapping("/admin/menu")
    public MenuItem addItem(@RequestBody MenuItem item) {
        return menuRepo.save(item);
    }

    @PutMapping("/admin/menu/{id}")
    public ResponseEntity<MenuItem> updateItem(@PathVariable Long id, @RequestBody MenuItem updated) {
        return menuRepo.findById(id).map(item -> {
            item.setName(updated.getName());
            item.setDescription(updated.getDescription());
            item.setPrice(updated.getPrice());
            item.setCategory(updated.getCategory());
            item.setImageUrl(updated.getImageUrl());
            item.setAvailable(updated.isAvailable());
            return ResponseEntity.ok(menuRepo.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/menu/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        menuRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
