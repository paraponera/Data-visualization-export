import { resolve } from 'path';
import exampleRoute from './server/routes/example';

export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'simpledatavisualization',
    uiExports: {
      
      app: {
        title: 'Simpledatavisualization',
        description: 'A kibana plugin that will allow us to build a custom table without metrics from the data stored in the ES indexes. It will show all the stored indexes in the ES instance, then all the present columns in the index to build the custom table. Then we will be able to export the table we had built as CSV',
        main: 'plugins/simpledatavisualization/app',
        icon: 'plugins/simpledatavisualization/tableee.svg'
      },
      
      
      translations: [
        resolve(__dirname, './translations/es.json')
      ],
      
      
      hacks: [
        'plugins/simpledatavisualization/hack'
      ]
      
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    
    init(server, options) {
      // Add server routes and initialize the plugin here
      exampleRoute(server);
    }
    

  });
};
