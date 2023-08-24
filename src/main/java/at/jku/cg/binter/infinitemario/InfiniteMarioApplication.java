package at.jku.cg.binter.infinitemario;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import at.jku.cg.binter.infinitemario.config.MarioConfiguration;

@SpringBootApplication
@EnableConfigurationProperties(MarioConfiguration.class)
public class InfiniteMarioApplication {

	public static void main(String[] args) {
		SpringApplication.run(InfiniteMarioApplication.class, args);
	}

}