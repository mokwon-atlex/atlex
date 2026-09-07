package com.example.atlex;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class AtlexApplication {

    public static void main(String[] args) {
        SpringApplication.run(AtlexApplication.class, args);
    }

}
