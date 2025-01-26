package com.QS.AppQuickSolutions;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// import com.QS.AppQuickSolutions.security.jwt.JwtProperties;
// @EnableConfigurationProperties(JwtProperties.class)

@SpringBootApplication
public class AppQuickSolutionsApplication {
	public static void main(String[] args) {
		SpringApplication.run(AppQuickSolutionsApplication.class, args);
	}

}

// public class AppQuickSolutionsApplication {
//     public static void main(String[] args) {
//         BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
//         String rawPassword = "boca123";
//         String encodedPassword = encoder.encode(rawPassword);
//         System.out.println(encodedPassword);
//     }
// }
