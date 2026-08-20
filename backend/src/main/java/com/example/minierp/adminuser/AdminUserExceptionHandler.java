package com.example.minierp.adminuser;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AliasExistsException;
import software.amazon.awssdk.services.cognitoidentityprovider.model.UsernameExistsException;

@RestControllerAdvice(assignableTypes = AdminUserController.class)
public class AdminUserExceptionHandler {

    @ExceptionHandler({UsernameExistsException.class, AliasExistsException.class})
    ResponseEntity<Map<String, String>> conflict() {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("email", "このメールアドレスは既に登録されています。"));
    }

    @ExceptionHandler(SdkException.class)
    ResponseEntity<Map<String, String>> cognitoFailure() {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of("message", "ユーザー管理サービスとの通信に失敗しました。"));
    }
}
