const bot = require('node-rocketchat-bot');
const keys = require('./auth.json');
const axios = require('axios');
const { authHeaders } = require('@rocket.chat/sdk/dist/lib/api');
const { concatSeries } = require('async');


function main() {
    //console.log(words);
    bot({
        host: keys.host,
        username: keys.username,
        password: keys.password,
        // use ssl for https
        ssl: true,
        pretty: false,
        // join room(s)
        rooms: [],
        // when ready (e.log.info logs to console, can also console.log)
        onWake: async event => event.log.info(`${event.bot.username} ready`),
        // on message
        onMessage: async event => {
            if (event.flags.isMentioned) {
                const words = event.message.content.split(' ');
                const operation = words[1] ? words[1].toLowerCase() : ''
                event.log.info(`operation is "${operation}"`)
                processCommand(words, event);
            }
        }
    });
}

async function processCommand(words, event) {
    if (words[1] == null) {
        event.respond("Incorrect Input, please try again or use help");
    }
    else if (words[2] == null && words[1].toLowerCase() == "help") {
        event.respond("");
    }
    else {
        switch (words[1].toLowerCase()) {
            case "status":
                getJobInfo(event);
                break;
            case "timelapse":
                getTimelapse(event);
                break;
            case "stream":
                getStream(event);
                break;
            default:
                event.respond("Incorrect Input, please try again or use help");
                break;
        }
    }
}

async function getJobInfo(event) {
    axios.get("http://"+ keys.APIhost + "/api/job?apikey=" + keys.API)
        .then(function (response) {
            // handle success
            let information = 
            "```" + "\n" + 
            "Average Print time: " + response.data.job.averagePrintTime + "\n" + 
            "Estimated Print time: " + response.data.job.estimatedPrintTime + "\n" + 
            "File: " + response.data.job.file.name + "\n" + 
            "===========================" + "\n" +
            "Completion: " + response.data.progress.completion + "\n" + 
            "Print Time: " + response.data.progress.printTime + "\n" + 
            "Print Time Left: " + response.data.progress.printTimeLeft + "\n" + 
            "===========================" + "\n" + 
            "State: " + response.data.state + "\n" +  
            "```";

            event.respond(information);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
}   

async function getTimelapse(event) {
    axios.get("http://"+ keys.APIhost + "/api/timelapse?apikey=" + keys.API)
    .then(function (response) {
        let information = "```\n";

        let files = response.data.files;
        files.forEach(file => {
            information += "========================\n";
            information += "File name: " + file.name + "\n";
            information += "File size: " + file.size + "\n";
            information += "Date: " + file.date + "\n";
            information += "Download: " + "http://" + keys.APIhost + file.url + "\n";
            information += "========================\n";
        });

        information += "```";
        event.respond(information);
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    })
}

async function getStream(event) {
    event.respond("http://"+ keys.APIhost + "/webcam/?action=stream");
    axios.get("http://"+ keys.APIhost + "/webcam/?action=stream?apikey=" + keys.API)
    .then(function (response) {
        console.log(response);
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    })
}


main();