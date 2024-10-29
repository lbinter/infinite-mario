var logFiles;
var responseEntity;
var selectLog;
var selectDownload;

var logs = {};

$(document).ready(function () {
    selectLog = $("#selectLog");
    selectDownload = $("#selectDownload");

    // populate log select
    fetch("./logs")
        .then((response) => response.json())
        .then((json) => {
            logFiles = json;
            addLogEntries(json);
        });

    $("#logs-download").click(function () {
        $('#selectLog option:selected').each(function () {
            downloadLogFile($(this).val())
        })
    });
});


async function downloadLogFiles(logFileName, size, spinner) {
    fetch("./logFile?name=" + logFileName)
        .then((response) => response.body)
        .then((data) => {
            responseEntity = data
            console.log(responseEntity);
        });
}

var logData; var logFile;

async function downloadLogFile(logFileName) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
    let option = $('#selectLog [value="' + logFileName + '"]');
    console.log('Downloading: ' + logFileName);
    fetch("./logAsJson?name=" + logFileName)
        .then((response) => {
            const reader = response.body.getReader();
            logs[logFileName].loaded = 0;
            return new ReadableStream({
                start(controller) {
                    return pump();
                    function pump() {
                        return reader.read().then(({ done, value }) => {
                            // When no more data needs to be consumed, close the stream
                            if (done) {
                                controller.close();
                                return;
                            }
                            logs[logFileName].loaded += value.length;
                            option.html(logFileName + ' | ' + humanFileSize(logs[logFileName].loaded) + '/' + humanFileSize(logs[logFileName].size));
                            // Enqueue the next data chunk into our target stream
                            controller.enqueue(value);
                            return pump();
                        });
                    }
                },
            });
        })
        // Create a new response out of the stream
        .then((stream) => new Response(stream))
        .then((response) => response.text())
        .then((text) => {
            logData = text;
            logs[logFileName].data = JSON.parse(text);
            option.remove();
            selectDownload.append($('<option>', {
                value: logFileName,
                text: logFileName + ' | ' + humanFileSize(logs[logFileName].size)
            }));
        })
        .catch((err) => alert(err));
}

function humanFileSize(size) {
    var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return +((size / Math.pow(1024, i)).toFixed(2)) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

function addLogEntries(json) {
    if (!json || !json.logs) {
        return;
    }
    json.logs.forEach(elem => {
        addLogEntry(elem);
    });
}

function addLogEntry(entry) {
    selectLog.append($('<option>', {
        value: entry.name,
        text: entry.name + ' | ' + humanFileSize(entry.size)
    }));
    logs[entry.name] = {
        size: entry.size,
        loaded: 0,
        data: ''
    };
}