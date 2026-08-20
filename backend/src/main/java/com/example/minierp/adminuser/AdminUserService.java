package com.example.minierp.adminuser;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminCreateUserRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminCreateUserResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.DeliveryMediumType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ListUsersRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ListUsersResponse;

@Service
public class AdminUserService {

    private final CognitoIdentityProviderClient cognito;
    private final String userPoolId;

    public AdminUserService(
            CognitoIdentityProviderClient cognito,
            @Value("${app.cognito.user-pool-id}") String userPoolId) {
        this.cognito = cognito;
        this.userPoolId = userPoolId;
    }

    public AdminUserPage findAll(int limit, String nextToken) {
        ListUsersResponse response = cognito.listUsers(ListUsersRequest.builder()
                .userPoolId(userPoolId)
                .limit(limit)
                .paginationToken(blankToNull(nextToken))
                .build());

        List<AdminUserResponse> users = response.users().stream()
                .map(AdminUserResponse::from)
                .toList();
        return new AdminUserPage(users, response.paginationToken());
    }

    public AdminUserResponse create(AdminUserRequest request) {
        String email = request.email().trim();
        AdminCreateUserResponse response = cognito.adminCreateUser(
                AdminCreateUserRequest.builder()
                        .userPoolId(userPoolId)
                        .username(UUID.randomUUID().toString())
                        .desiredDeliveryMediums(DeliveryMediumType.EMAIL)
                        .userAttributes(
                                attribute("email", email),
                                attribute("email_verified", "true"),
                                attribute("name", request.name().trim()))
                        .build());
        return AdminUserResponse.from(response.user());
    }

    private AttributeType attribute(String name, String value) {
        return AttributeType.builder().name(name).value(value).build();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
