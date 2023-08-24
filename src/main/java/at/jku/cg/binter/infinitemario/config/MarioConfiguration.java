package at.jku.cg.binter.infinitemario.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
@Primary
@ConfigurationProperties("mario")
public class MarioConfiguration {
    private String logFolder;
    private boolean displayScore = false;

    public boolean isDisplayScore() {
        return displayScore;
    }

    public void setDisplayScore(boolean displayScore) {
        this.displayScore = displayScore;
    }

    public String getLogFolder() {
        return logFolder;
    }

    public void setLogFolder(String logFolder) {
        this.logFolder = logFolder;
    }
}