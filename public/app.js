import moment from 'moment';
import { uiModules } from 'ui/modules';
import uiRoutes from 'ui/routes';

import 'ui/autoload/styles';
import './less/main.less';
import template from './templates/index.html';
import 'elasticsearch-browser'; 
import 'ng-csv';
import 'ng-table';


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
  .get('app/simpledatavisualization', ['elasticsearch','ngSanitize', 'ngCsv','ngTable'])
  .service('es', function (esFactory) {
  return esFactory({ host: 'localhost:9200' }); //To configure to match with you ES instance configuration
  })
  .controller('sdvController', function ($scope, $route, $interval, $http, es,$filter, NgTableParams) {
    $scope.allData          = [];    //variable to get all the data saved in the index chosen by the user
    $scope.columns          = [];    //variable to store the name of the columns present in the index chosen by the user
    $scope.total            = 0;     //variable to store the number of hits for the index 
    $scope.listIndices      = [];    //variable to store all the the names of the indexes stored in the ES instance
    $scope.choiceIn         = false; //variable set to true if the user has already chosen an index
    $scope.choiceCol        = 0;     //variable that store the number of columns chosen by the user
    $scope.colsDisp         = [];    //variable to store the names of the columns that have been chosen by the user
    var colPicked           = '';    //string variable that will store the names of the columns chosen by the user to avoid redundancy 
    $scope.boutonActif      = [];    //table variable that will store as an index the names of the columns chosen by the user and the content will be the index in the html side
    $scope.requestSize      = 20;    //variable to set in the search request the number of hits we want to get in return initialized by default to 20 
    $scope.tabCustomPaginate= [];    //table variable that will store the data from the index depends on what columns the user had chosen
    $scope.tableCsv         = [];    //table variable that will be needed for the CSV export
    
  
    //Function that return the state of the cluster
    es.cluster.health(function (err, resp) {
          if (err) {
              $scope.data = err.message;
          } else {
              $scope.data = resp;
          }
      });
    
    
    
    //Function to load all the indexes stored in the ES instance 
    $scope.loadIndexes    = function(){
      es.cat.indices({
        bytes: "k",
        v : true,
        format : "json" 
          },function(r,q){
        $scope.listIndices = angular.fromJson(q);
      })
    };
      
    //Function to pick columns
    $scope.colPicker            = function(col,index){
      $scope.boutonActif[col]   = index;
      $scope.export             = false;
      if(colPicked.indexOf(col) ==-1){
        $scope.choiceCol        += 1;
        colPicked               = colPicked +' '+ col;
        $scope.colsDisp.push(col);
      }else{
        window.alert("Vous ne pouvez pas choisir deux fois la même colonne!");
      }
    };

    //Function to delete columns from the table
    $scope.colUnpick    = function(colp,index){
      $scope.colsDisp.splice(index,1);
      $scope.export     = false;
      delete $scope.boutonActif[colp];
      colPicked         =colPicked.replace(colp,"");
      $scope.choiceCol  -= 1;
    }
    
    //Function to change the size of the search request sent to ES
    $scope.sizeChanger       = function(requestSize){
      $scope.requestSize     = requestSize;
      $scope.export          = false; 
      es.search({
        index: $scope.indexCourant,
        size: requestSize,
        body: {
            "query":
              {
                match_all : {}
              },
            }     
        }).then(function (response) {
        $scope.total            = response.hits.total;
        $scope.allData          = [];
        $scope.allData          = angular.fromJson(response.hits.hits); 
        $scope.choiceIn         = true;
        $scope.tabCustomPaginate= [];
        for (var i = 0; i < $scope.allData.length; i++) {
          $scope.tabCustomPaginate[i]=$scope.allData[i]._source;
        }
        $scope.tableParams      = new NgTableParams({
              page: 1, // show first page
              count: 10 // count per page
          }, {
              filterDelay: 0,
              dataset: $scope.tabCustomPaginate
          });
      }); 
    }

    //Function to load the data for the columns chosen by the user
    $scope.loadData       = function(indexx,index){
      $scope.boutonActif  = [];
      $scope.indexActif   = index;
      $scope.indexCourant = indexx;
      $scope.choiceCol    = 0;
      if($scope.choiceIn  = true){
        $scope.initAll(); 
      }
      es.search({
        index: indexx,
        size: 20,
        body: {
            "query":
              {
                match_all : {}
              },
            }     
      }).then(function (response) {
        $scope.total    = response.hits.total;
        $scope.allData  = angular.fromJson(response.hits.hits);
        for (var i = 0; i < $scope.allData.length; i++) {
          $scope.tabCustomPaginate[i]=$scope.allData[i]._source;
        }
        var c               = 0;
        var columnsInn      = response.hits.hits[0]._source;
        for(var keyy in columnsInn){
          $scope.columns[c] = keyy;
          c++;
        } 
        $scope.choiceIn     = true;
        $scope.tableParams  = new NgTableParams({
          page: 1, // show first page
          count: 10 // count per page
        }, {
            filterDelay: 0,
            dataset: $scope.tabCustomPaginate
        });
      });
    };
    
    //Function to init almost all variables that needs to 
    $scope.initAll              = function(){
      $scope.allData            = [];
      $scope.columns            = [];
      colPicked                 = '';
      $scope.colsDisp           = [];
      $scope.tabCustomPaginate  = [];
      $scope.export             = false;
    }

    //Function to prepare the data that will be exported as CSV
    $scope.exportCSV    = function(){
      var c             =  0;
      $scope.tableCsv   = [];
      $scope.colExport  = []; 
      $scope.export     = true;
      var source        = '';
      source            = $scope.colsDisp[0];
      if($scope.colsDisp.length>1){
        for (var i = 1; i < $scope.colsDisp.length; i++) {
          source        = source+','+$scope.colsDisp[i]; 
        }
      }
      es.search({
        index: $scope.indexCourant,
        size: $scope.requestSize,
        _source_include :source,
        body: {
            "query":
              {
                match_all : {}
              },
            }     
        }).then(function (response) {
        $scope.allData  = angular.fromJson(response.hits.hits);
        for (var i = 0; i < $scope.allData.length; i++) {
          $scope.tableCsv[i]=$scope.allData[i]._source;
        }
        var columnsExp          = response.hits.hits[0]._source;
        for(var keys in columnsExp){
          $scope.colExport[c]   = keys;
          c++;
        }
      });
    }
  });
