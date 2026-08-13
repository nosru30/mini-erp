package com.example.minierp.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import com.example.minierp.HealthController;

@WebMvcTest(
        controllers = HealthController.class,
        properties = "app.docs.enabled=true")
@Import(SecurityConfig.class)
class SwaggerSecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void swaggerPathIsPublicWhenDocsAreEnabled() throws Exception {
        mockMvc.perform(get("/swagger-ui/not-found"))
                .andExpect(status().isNotFound());
    }
}
