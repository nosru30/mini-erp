package com.example.minierp;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.security.SecurityRequirements;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    @SecurityRequirements
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }
}
