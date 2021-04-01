import { ArgumentCollectorResult, Command, CommandInfo, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Connection } from 'typeorm';
import { ConnectionClientOptions } from './interfaces';

export class ConnectionClient extends CommandoClient {
  constructor(options: ConnectionClientOptions) {
    super(options);
    this.conn = options.conn;
  }

  public conn!: Connection;
}

export class ConnectionCommand extends Command {
  constructor(client: ConnectionClient, info: CommandInfo) {
    super(client, info);
  }

  public readonly client!: ConnectionClient;

  public abstract run(message: CommandoMessage, args: object | string | string[], fromPattern: boolean, result?: ArgumentCollectorResult): 
}
