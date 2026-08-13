package com.example.minierp.config;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.test.web.servlet.MockMvc;

import com.example.minierp.HealthController;

@WebMvcTest(HealthController.class)
@Import(SecurityConfig.class)
class SecurityConfigTest {

    private static final String ISSUER = "https://cognito.example/user-pool";
    private static final String CLIENT_ID = "frontend-client";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthEndpointIsPublic() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk());
    }

    @Test
    void applicationApiRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void swaggerIsUnavailableWhenDocsAreDisabled() throws Exception {
        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminApiRejectsAuthenticatedNonAdminUser() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .with(jwt().jwt(token -> token.claim("username", "user"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminRoleCanAccessAdminApi() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void cognitoAdminGroupIsMappedToAdminRole() {
        Jwt jwt = jwtBuilder()
                .claim("username", "admin")
                .claim("cognito:groups", List.of("ADMIN"))
                .build();

        JwtAuthenticationConverter converter =
                new SecurityConfig().jwtAuthenticationConverter();

        assertThat(converter.convert(jwt).getAuthorities())
                .contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    @Test
    void acceptsAccessTokenForConfiguredClient() {
        Jwt jwt = jwtBuilder()
                .claim("token_use", "access")
                .claim("client_id", CLIENT_ID)
                .build();

        assertThat(SecurityConfig.cognitoTokenValidator(ISSUER, CLIENT_ID)
                .validate(jwt).hasErrors()).isFalse();
    }

    @Test
    void rejectsIdToken() {
        Jwt jwt = jwtBuilder()
                .claim("token_use", "id")
                .claim("client_id", CLIENT_ID)
                .build();

        assertThat(SecurityConfig.cognitoTokenValidator(ISSUER, CLIENT_ID)
                .validate(jwt).hasErrors()).isTrue();
    }

    @Test
    void rejectsAccessTokenForAnotherClient() {
        Jwt jwt = jwtBuilder()
                .claim("token_use", "access")
                .claim("client_id", "another-client")
                .build();

        assertThat(SecurityConfig.cognitoTokenValidator(ISSUER, CLIENT_ID)
                .validate(jwt).hasErrors()).isTrue();
    }

    private Jwt.Builder jwtBuilder() {
        return Jwt.withTokenValue("token")
                .header("alg", "RS256")
                .issuer(ISSUER)
                .subject("user-id")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(300));
    }
}
