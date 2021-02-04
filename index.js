///// INTIALIZATION /////
// required modules
const { config } = require("dotenv");
config({path: `${__dirname}/process.env`});
const fs = require("fs");
const { CommandoClient } = require("discord.js-commando");
const configFile = "config.json";
const { prefix, currentowner, homeguild, homeinvite } = require(`./${configFile}`);

// Commando client
const client = new CommandoClient({
    commandPrefix:      prefix,
    owner:              currentowner,
    homeguild:          homeguild,
    invite:             homeinvite,
    disableEveryone:    true
});

///// read client event files
fs.readdir("./events/", (error, files) => {
    if (error) return console.log(error);
    files.forEach(file => {
        let event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        client.on(eventName, event.bind(null, client));
    });
});


///// LOG CLIENT INTO DISCORD
client.login(process.env.CLIENT_TOKEN);
