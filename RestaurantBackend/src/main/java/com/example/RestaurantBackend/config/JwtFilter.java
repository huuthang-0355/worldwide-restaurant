package com.example.RestaurantBackend.config;

import com.example.RestaurantBackend.service.JwtService;
import com.example.RestaurantBackend.service.MyUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final ApplicationContext context;


    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/verify-email",
            "/api/auth/check-email",
//            "/api/auth/resend-verification",
            "/api/auth/forgot-password",
            "/api/auth/reset-password"
    );


    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        return PUBLIC_PATHS.stream().anyMatch(publicPath -> path.startsWith(publicPath));
    }


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1. retrieve the 'Authorization' header from request
        String authHeader = request.getHeader("Authorization");

//        // 2. check if the header exists and starts with 'Bearer '
//        if(authHeader != null && authHeader.startsWith("Bearer ")) {
//            // extract token (remove Bearer prefix)
//            token = authHeader.substring(7);
//
//            // extract email
//            email = jwtService.extractEmail(token);
//        }

        // 2. No token provided - let spring secuirty handle it
        if(!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        // 3. process the token if an email was found and the user is not already authenticated
        if(email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 4. load full UserDetails from database
            UserDetails userDetails = context.getBean(MyUserDetailsService.class)
                    .loadUserByUsername(email);

            // 5. validate token (check signature)
            if(jwtService.validateToken(token, userDetails)) {
                // 6. create 'Authentication Object', which Spring uses for user.
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                // 7. add request details to Auth object for tracking
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 8. place Auth object into Security Context
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // next filter like middleware
        filterChain.doFilter(request, response);
    }
}
