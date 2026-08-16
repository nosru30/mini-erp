package com.example.minierp.adminuser;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminCreateUserRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminCreateUserResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.DeliveryMediumType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ListUsersRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ListUsersResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.UserStatusType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.UserType;

class AdminUserServiceTest {

    private CognitoIdentityProviderClient cognito;
    private AdminUserService service;

    @BeforeEach
    void setUp() {
        cognito = Mockito.mock(CognitoIdentityProviderClient.class);
        service = new AdminUserService(cognito, "ap-northeast-1_pool");
    }

    @Test
    void findAllMapsUsersAndPaginationToken() {
        UserType user = cognitoUser("user@example.com", "山田 太郎");
        when(cognito.listUsers(any(ListUsersRequest.class)))
                .thenReturn(ListUsersResponse.builder()
                        .users(user)
                        .paginationToken("next-page")
                        .build());

        AdminUserPage result = service.findAll(20, "current-page");

        assertThat(result.nextToken()).isEqualTo("next-page");
        assertThat(result.users()).singleElement().satisfies(mapped -> {
            assertThat(mapped.email()).isEqualTo("user@example.com");
            assertThat(mapped.name()).isEqualTo("山田 太郎");
            assertThat(mapped.status()).isEqualTo("FORCE_CHANGE_PASSWORD");
            assertThat(mapped.enabled()).isTrue();
        });

        ArgumentCaptor<ListUsersRequest> captor =
                ArgumentCaptor.forClass(ListUsersRequest.class);
        verify(cognito).listUsers(captor.capture());
        assertThat(captor.getValue().userPoolId()).isEqualTo("ap-northeast-1_pool");
        assertThat(captor.getValue().limit()).isEqualTo(20);
        assertThat(captor.getValue().paginationToken()).isEqualTo("current-page");
    }

    @Test
    void createUsesEmailAsUsernameAndLetsCognitoIssueTemporaryPassword() {
        UserType user = cognitoUser("user@example.com", "山田 太郎");
        when(cognito.adminCreateUser(any(AdminCreateUserRequest.class)))
                .thenReturn(AdminCreateUserResponse.builder().user(user).build());

        AdminUserResponse result = service.create(
                new AdminUserRequest(" user@example.com ", " 山田 太郎 "));

        assertThat(result.email()).isEqualTo("user@example.com");
        ArgumentCaptor<AdminCreateUserRequest> captor =
                ArgumentCaptor.forClass(AdminCreateUserRequest.class);
        verify(cognito).adminCreateUser(captor.capture());
        AdminCreateUserRequest sent = captor.getValue();
        assertThat(sent.username()).isEqualTo("user@example.com");
        assertThat(sent.temporaryPassword()).isNull();
        assertThat(sent.desiredDeliveryMediums())
                .containsExactly(DeliveryMediumType.EMAIL);
        assertThat(sent.userAttributes())
                .contains(
                        attribute("email", "user@example.com"),
                        attribute("email_verified", "true"),
                        attribute("name", "山田 太郎"));
    }

    private UserType cognitoUser(String email, String name) {
        return UserType.builder()
                .username(email)
                .attributes(attribute("email", email), attribute("name", name))
                .userStatus(UserStatusType.FORCE_CHANGE_PASSWORD)
                .enabled(true)
                .userCreateDate(Instant.parse("2026-01-01T00:00:00Z"))
                .userLastModifiedDate(Instant.parse("2026-01-02T00:00:00Z"))
                .build();
    }

    private AttributeType attribute(String name, String value) {
        return AttributeType.builder().name(name).value(value).build();
    }
}
