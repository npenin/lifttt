import * as akala from '@akala/server'
import { channel } from '../channel'
import { Connection, Client } from '@akala/json-rpc-ws';
import * as fs from 'fs';
import { promisify } from 'util'
import * as uuid from 'uuid'

akala.injectWithNameAsync(['$agent.lifttt'], async (lifttt: Client<Connection>) =>
{
    var registeredTriggers: { [triggerId: string]: any } = {};

    var cl = akala.api.jsonrpcws(channel).createClient(lifttt, {
        executeAction: function (action)
        {

        },
        executeCondition: function (condition)
        {

        },
        executeTrigger: async function (trigger)
        {
            switch (trigger.name)
            {
                case 'watch':
                    var stat = await promisify(fs.stat)(trigger.fields['path'] as string);
                    if (stat.isDirectory() || stat.isFile())
                    {
                        var id = uuid();
                        var watcher = fs.watch(trigger.fields['path'] as string, function (event, fileName)
                        {
                            if (!trigger.fields['event'] || trigger.fields['event'] == event)
                                server.trigger({ id: id, data: { path: fileName, mtime: new Date().toJSON() } });
                        });
                        registeredTriggers[id] = watcher;
                    }
                    break;
            }
            return null;
        }
    });
    var server = cl.$proxy();
    await server.registerChannel({ name: 'fs', view: '@domojs/lifttt/fs.html', icon: 'file' });
    await server.registerTrigger({ name: 'watch', icon: 'file-medical-alt', view: '@domojs/lifttt/fs-watch.html', fields: [{ name: 'path', type: 'string' }] })
})