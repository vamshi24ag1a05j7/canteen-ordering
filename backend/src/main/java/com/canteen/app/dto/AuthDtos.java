package com.canteen.app.dto;

import java.util.List;

public class AuthDtos {

    public static class RegisterRequest {
        private String fullName;
        private String email;
        private String password;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String token;
        private String role;
        private String email;
        private String fullName;

        public AuthResponse(String token, String role, String email, String fullName) {
            this.token = token;
            this.role = role;
            this.email = email;
            this.fullName = fullName;
        }

        public String getToken() { return token; }
        public String getRole() { return role; }
        public String getEmail() { return email; }
        public String getFullName() { return fullName; }
    }
}
