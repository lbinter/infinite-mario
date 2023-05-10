package at.jku.cg.binter.infinitemario.io;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class MarioLogWriter {
    final private File logFile;
    final private BufferedWriter writer;

    public MarioLogWriter(String folder, String filename) throws IOException {
        File logFolder = new File(folder);
        if (!logFolder.exists()) {
            if (logFolder.mkdirs()) {
                log.debug("Created folder: " + folder);
            } else {
                throw new IOException("Could not create folder:" + folder);
            }
        }
        this.logFile = new File(logFolder, filename);
        writer = new BufferedWriter(new FileWriter(logFile));
    }

    public void writeLine(String line) {
        try {
            writer.write(line);
            writer.newLine();
        } catch (IOException e) {
            log.error("Could not write line: line", e);
            e.printStackTrace();
        }
    }

    public void finish() {
        try {
            writer.flush();
            writer.close();
        } catch (IOException e) {
            log.error("Could not close writer.", e);
            e.printStackTrace();
        }
    }

    public File getLogFile() {
        return logFile;
    }
}
