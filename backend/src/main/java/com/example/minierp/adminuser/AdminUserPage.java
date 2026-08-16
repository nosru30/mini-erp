package com.example.minierp.adminuser;

import java.util.List;

public record AdminUserPage(
        List<AdminUserResponse> users,
        String nextToken) {
}
