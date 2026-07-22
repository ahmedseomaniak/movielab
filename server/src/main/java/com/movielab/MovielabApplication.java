package com.movielab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class MovielabApplication {
    public static void main(String[] args) {
        SpringApplication.run(MovielabApplication.class, args);
    }
}
