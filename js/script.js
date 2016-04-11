/**
 * Create the module. Set it up to use html5 mode.
 */
window.MyOpenmovies = angular.module('myOpenmovies', ['elasticsearch','ui.bootstrap','ngMaterial','angularGrid'],
    ['$locationProvider', function($locationProvider){
        $locationProvider.html5Mode({
 		 enabled: true,
 		 requireBase: false
		});
    }]
);

MyOpenmovies.controller('ModalDemoCtrl', function ($scope, $uibModal, $log) {

  $scope.items = ['item1', 'item2', 'item3'];

  $scope.animationsEnabled = true;

  $scope.open = function (size) {

    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };

});

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

MyOpenmovies.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $uibModalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

/**
 * Create a service to power calls to Elasticsearch. We only need to
 * use the _search endpoint.
 */
MyOpenmovies.factory('movieService',
    ['$q', 'esFactory', '$location', function($q, elasticsearch, $location){
        var client = elasticsearch({
            host: "vps82673.ovh.net/proxy/http://vps82673.ovh.net:9200"
        });

        /**
         * Given a term and an offset, load another round of 10 movies.
         *
         * Returns a promise.
         */
        var search = function(term, offset){
            var deferred = $q.defer();
            var query = {
                "match": {
                    "_all": term
                }
            };

            client.search({
                "index": 'movies',
                "type": 'movie',
                "body": {
                    "size": 10,
                    "from": (offset || 0) * 10,
                    "query": query
                }
            }).then(function(result) {
                var ii = 0, hits_in, hits_out = [];
                hits_in = (result.hits || {}).hits || [];
                for(;ii < hits_in.length; ii++){
                    hits_out.push(hits_in[ii]._source);
                }
                deferred.resolve(hits_out);
            }, deferred.reject);

            return deferred.promise;
        };


        return {
            "search": search
        };
    }]
);


/**
 * Create a controller to interact with the UI.
 */
MyOpenmovies.controller('movieCtrl',
    ['movieService', '$scope', '$location', function(movies, $scope, $location){
        // Provide some nice initial choices
        var initChoices = [
            "rendang",
            "nasi goreng",
            "pad thai",
            "pizza",
            "lasagne",
            "ice cream",
            "schnitzel",
            "hummous"
        ];

        


       // var idx = Math.floor(Math.random() * initChoices.length);

        // Initialize the scope defaults.
        $scope.movies = [];        // An array of movie results to display
        $scope.page = 0;            // A counter to keep track of our current page
        $scope.allResults = false;  // Whether or not all results have been found.

        // And, a random search term to start if none was present on page load.
        //  $scope.searchTerm = $location.search().q || initChoices[idx];

        /**
         * A fresh search. Reset the scope variables to their defaults, set
         * the q query parameter, and load more results.
         */
        $scope.search = function(){
    
            $scope.page = 0;
            $scope.movies = [];
            $scope.allResults = false;
            $location.search({'q': $scope.searchTerm});
            $scope.loadMore();
	   	    
	    $scope.searchTerm = $location.search().q;
            $scope.$digest();
        };

$scope.reload = function()
{
 if($scope.movies.length == 0){
   
}else{
//location.reload(); 
}
};

        /**
         * Load the next page of results, incrementing the page counter.
         * When query is finished, push results onto $scope.movies and decide
         * whether all results have been returned (i.e. were 10 results returned?)
         */
        $scope.loadMore = function(){
            movies.search($scope.searchTerm, $scope.page++).then(function(results){
                if(results.length !== 10){
                    $scope.allResults = true;
                }

                var ii = 0;
                for(;ii < results.length; ii++){
                    $scope.movies.push(results[ii]);
                }
            });
        };

        // Load results on first run
        //$scope.loadMore();
    }]
);
