package com.example.minierp.adminuser;

import java.time.Instant;
import java.util.List;

import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.UserType;

public record AdminUserResponse(
        String username,
        String email,
        String name,
        String status,
        boolean enabled,
        Instant createdAt,
        Instant updatedAt) {

    static AdminUserResponse from(UserType user) {
        return new AdminUserResponse(
                user.username(),
                attribute(user.attributes(), "email"),
                attribute(user.attributes(), "name"),
                user.userStatusAsString(),
                Boolean.TRUE.equals(user.enabled()),
                user.userCreateDate(),
                user.userLastModifiedDate());
    }

    private static String attribute(List<AttributeType> attributes, String name) {
        if (attributes == null) return null;
        return attributes.stream()
                .filter(attribute -> name.equals(attribute.name()))
                .map(AttributeType::value)
                .findFirst()
                .orElse(null);
    }
}
