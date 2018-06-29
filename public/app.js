import moment             from 'moment';
import { uiModules }      from 'ui/modules';
import uiRoutes           from 'ui/routes';
import { sdvController }  from './controller/sdvController';

import                         'ui/autoload/styles';
import                         './less/main.less';
import template           from './templates/index.html';
import                         'elasticsearch-browser';
import                         'ng-csv';
import                         'ng-table';
import                         'sweetalert2';


uiRoutes.enable();
uiRoutes
  .when('/', {
    template,
    resolve: {
      currentTime($http) {
        return $http.get('../api/simpledatavisualization/example').then(function (resp) {
          return resp.data.time;
        });
      }
    }
  });

uiModules
  .get('app/simpledatavisualization', ['elasticsearch', 'ngSanitize', 'ngCsv', 'ngTable'])
  .service('es', function (esFactory) {
    return esFactory({ host: 'localhost:9200' }); //To configure to match with you ES instance configuration
  })
  .controller('sdvController', sdvController);
  