package com.cs502.hw4.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .authorizeRequests(authz -> authz
                .anyRequest().permitAll()) 
            .csrf().disable() 
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) 
            .and()
            .build();
    }
}
