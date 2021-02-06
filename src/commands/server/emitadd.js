// emitadd.js

///// imports
const { Command } = require('discord.js-commando');

module.exports = class emitadd extends Command {
    constructor(client) {
        super(client, {
            name: "emitadd",
            group: "server",
            memberName: "emitadd",
            description: "Emits the guildMemberAdd event to the client in the messaged server.",
            guildOnly: true,
        });
    }

    async run(message) {
        message.client.emit("guildMemberAdd", message.member)        
    }
};