package com.example.atlex.domain.github.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AesEncryptionUtilsTest {

    private static final String SECRET_KEY = "test-encryption-key-for-unit-test!";

    @Test
    @DisplayName("문자열을 암호화한 뒤 복호화하면 원본 문자열과 일치한다")
    void encryptAndDecryptSuccess() {
        // given
        String originalToken = "gho_16C7e42F292c6912E7710c838347Ae178B4a";

        // when
        String encrypted = AesEncryptionUtils.encrypt(originalToken, SECRET_KEY);
        String decrypted = AesEncryptionUtils.decrypt(encrypted, SECRET_KEY);

        // then
        assertThat(encrypted).isNotEqualTo(originalToken);
        assertThat(decrypted).isEqualTo(originalToken);
    }

    @Test
    @DisplayName("null 또는 빈 문자열을 전달하면 그대로 반환한다")
    void encryptNullOrEmpty() {
        assertThat(AesEncryptionUtils.encrypt(null, SECRET_KEY)).isNull();
        assertThat(AesEncryptionUtils.encrypt("", SECRET_KEY)).isEmpty();
        assertThat(AesEncryptionUtils.decrypt(null, SECRET_KEY)).isNull();
        assertThat(AesEncryptionUtils.decrypt("", SECRET_KEY)).isEmpty();
    }
}
