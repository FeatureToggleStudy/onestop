package org.cedar.onestop.api.search.security.config

import com.google.common.collect.ImmutableList
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.oauth2.client.endpoint.DefaultAuthorizationCodeTokenResponseClient
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository
import org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizationRequestRepository
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest
import org.springframework.security.web.authentication.ui.DefaultLoginPageGeneratingFilter
import org.springframework.security.web.util.matcher.AntPathRequestMatcher
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CorsFilter

@EnableWebSecurity
class SecurityConfig extends WebSecurityConfigurerAdapter {

    static final String LOGIN_ENDPOINT = DefaultLoginPageGeneratingFilter.DEFAULT_LOGIN_PAGE_URL
    static final String LOGIN_SUCCESS_ENDPOINT = "/login_success"
    static final String LOGIN_FAILURE_ENDPOINT = "/login_failure"
    static final String LOGIN_PROFILE_ENDPOINT = "/login_profile"
    static final String LOGOUT_ENDPOINT = "/logout"
    static final String LOGOUT_SUCCESS_ENDPOINT = "/logout_success"

    private KeystoreUtil keystoreUtil
    private String successRedirect

    @Autowired
    SecurityConfig(LoginGovKeystoreConfiguration keystoreConfig, LoginGovSuccessRedirectConfiguration successRedirectConfiguration) {
        keystoreUtil = new KeystoreUtil(
                keystoreConfig.file,
                keystoreConfig.password,
                keystoreConfig.alias,
                null,
                keystoreConfig.type
        )
        successRedirect = successRedirectConfiguration.successRedirect
    }

    @Autowired
    ClientRegistrationRepository clientRegistrationRepository

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
        // login, login failure, and index are allowed by anyone
        .antMatchers(LOGIN_ENDPOINT, LOGIN_SUCCESS_ENDPOINT, LOGIN_PROFILE_ENDPOINT, LOGIN_FAILURE_ENDPOINT, LOGOUT_SUCCESS_ENDPOINT, "/")
            .permitAll()
        // make sure our public search endpoints are still available and don't request authentication
        .antMatchers(
                "/collection/**",
                "/search/collection/**",
                "/granule/**",
                "/search/granule/**",
                "/flattened-granule/**",
                "/search/flattened-granule/**",
                "/uiConfig",
                "/sitemap/**",
                "/trending/**",
                "/actuator/info"
        )
            .permitAll()
        // any other requests are allowed by an authenticated user
        .anyRequest()
            .authenticated()
            .and()
        // custom logout behavior
        .logout()
            .logoutRequestMatcher(new AntPathRequestMatcher(LOGOUT_ENDPOINT))
            .deleteCookies("JSESSIONID")
            .invalidateHttpSession(true)
            .logoutSuccessHandler(new LoginGovLogoutSuccessHandler())
            .and()
        // configure authentication support using an OAuth 2.0 and/or OpenID Connect 1.0 Provider
        .oauth2Login()
            .authorizationEndpoint()
            .authorizationRequestResolver(new LoginGovAuthorizationRequestResolver(clientRegistrationRepository))
            .authorizationRequestRepository(authorizationRequestRepository())
            .and()
            .tokenEndpoint()
            .accessTokenResponseClient(accessTokenResponseClient())
            .and()
            .failureUrl(LOGIN_FAILURE_ENDPOINT)
            .successHandler(new LoginGovAuthenticationSuccessHandler())
    }

    @Bean
    CorsFilter corsFilter() {
        final String allowedOrigin = "http://localhost:8080"

        // fix OPTIONS preflight login profile request failure with 403 Invalid CORS request
        CorsConfiguration config = new CorsConfiguration()
        config.addAllowedOrigin(allowedOrigin)
        config.setAllowedHeaders(ImmutableList.of("Authorization", "Cache-Control", "Content-Type"))
        config.addAllowedMethod(HttpMethod.OPTIONS)
        config.addAllowedMethod(HttpMethod.GET)
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration(LOGIN_PROFILE_ENDPOINT, config)
        return new CorsFilter(source)
    }

    @Bean
    AuthorizationRequestRepository<OAuth2AuthorizationRequest> authorizationRequestRepository() {
        return new HttpSessionOAuth2AuthorizationRequestRepository()
    }

    @Bean
    OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> accessTokenResponseClient() {
        DefaultAuthorizationCodeTokenResponseClient accessTokenResponseClient = new DefaultAuthorizationCodeTokenResponseClient()
        accessTokenResponseClient.setRequestEntityConverter(new LoginGovTokenRequestConverter(clientRegistrationRepository, keystoreUtil))
        return accessTokenResponseClient
    }
}
