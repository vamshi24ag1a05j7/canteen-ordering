package com.canteen.app.config;

import com.canteen.app.model.MenuItem;
import com.canteen.app.model.User;
import com.canteen.app.repository.MenuItemRepository;
import com.canteen.app.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final MenuItemRepository menuRepo;
    private final PasswordEncoder encoder;

    public DataSeeder(UserRepository userRepo, MenuItemRepository menuRepo, PasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.menuRepo = menuRepo;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepo.existsByEmail("admin@canteen.college")) {
            User admin = new User();
            admin.setFullName("Admin");
            admin.setEmail("admin@canteen.college");
            admin.setPassword(encoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            userRepo.save(admin);
        }

        if (menuRepo.count() == 0) {
            String[][] items = {
                {"Masala Dosa", "Crispy dosa with spiced potato filling", "40", "South Indian"},
                {"Idli Sambar", "Soft idlis with sambar and chutney", "30", "South Indian"},
                {"Veg Biryani", "Fragrant rice with mixed vegetables", "80", "Rice"},
                {"Chicken Biryani", "Spiced rice with tender chicken", "100", "Rice"},
                {"Paneer Butter Masala", "Cottage cheese in rich tomato gravy", "90", "Curry"},
                {"Dal Tadka", "Yellow lentils with tempering", "60", "Curry"},
                {"Samosa", "Crispy pastry with spiced potato filling", "15", "Snacks"},
                {"Cold Coffee", "Chilled coffee with milk and ice cream", "50", "Beverages"}
            };
            for (String[] i : items) {
                MenuItem m = new MenuItem();
                m.setName(i[0]);
                m.setDescription(i[1]);
                m.setPrice(Double.parseDouble(i[2]));
                m.setCategory(i[3]);
                m.setAvailable(true);
                menuRepo.save(m);
            }
        }
    }
}
