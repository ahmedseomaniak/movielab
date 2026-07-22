package com.movielab.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();
        manager.registerCustomCache("tmdb.movie",
                Caffeine.newBuilder().expireAfterWrite(1, TimeUnit.HOURS).maximumSize(200).build());
        manager.registerCustomCache("tmdb.credits",
                Caffeine.newBuilder().expireAfterWrite(1, TimeUnit.HOURS).maximumSize(200).build());
        manager.registerCustomCache("tmdb.search",
                Caffeine.newBuilder().expireAfterWrite(15, TimeUnit.MINUTES).maximumSize(100).build());
        manager.registerCustomCache("tmdb.discover",
                Caffeine.newBuilder().expireAfterWrite(15, TimeUnit.MINUTES).maximumSize(100).build());
        manager.registerCustomCache("tmdb.trending",
                Caffeine.newBuilder().expireAfterWrite(15, TimeUnit.MINUTES).maximumSize(10).build());
        manager.registerCustomCache("tmdb.recommendations",
                Caffeine.newBuilder().expireAfterWrite(30, TimeUnit.MINUTES).maximumSize(100).build());
        return manager;
    }
}
