angular.module("notesApp", ["ui.router", "notesApp.notes"])
    .run(["$rootScope", "$location", function ($rootScope, $location) {

        var regex = new RegExp("main\/([\\w-]*)(:?\#)?");
        var user = $location.absUrl().match(regex);
        $rootScope.currentUser = user.length > 0 ? user[1] : "";

    }]
)
    .config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider
            //.when('/update', '/update/:noteID')
            .otherwise('/allNotes');

        $stateProvider
            .state("create", {
                url: "/create",
                templateUrl: "../partialViews/noteModal.html",
                controller: function ($scope, $rootScope, notesResource) {

                    $rootScope.selectedNote = null;
                    $scope.modalMode = "Create";

                    $scope.createNote = function (note, form) {

                        if (form.$valid) {
                            $rootScope.selectedNote = new notesResource();
                            angular.extend($rootScope.selectedNote, note);
                            $rootScope.selectedNote.$save({username: $scope.currentUser});
                            $rootScope.selectedNote = null;
                            form.$setPristine();
                        }

                    };

                    $scope.cancelEdit = function (note, form) {
                        if (note && note._id)
                            note.$get({username: $rootScope.currentUser});

                        form.$setPristine();

                        $rootScope.selectedNote = null;
                    };
                }
            })
            .state("update", {
                url: "/update/:noteID",
                templateUrl: "../partialViews/noteModal.html",
                controller: function ($scope, $rootScope, notesResource, $state) {

                    notesResource.get({username: $rootScope.currentUser, noteId: $state.params.noteID}).$promise.then(function(data){
                        $rootScope.selectedNote = data;
                    }, function(){
                        alert("That note does not exist.");
                        $rootScope.selectedNote = null;
                        $state.go("create");
                    });

                    $scope.modalMode = "Update";

                    $scope.createNote = function (note, form) {
                        if (form.$valid && $rootScope.selectedNote) {
                            $rootScope.selectedNote.$save({username: $rootScope.currentUser});
                            $rootScope.selectedNote = null;
                            form.$setPristine();
                        }
                    };

                    $scope.cancelEdit = function (note, form) {

                        if ($rootScope.selectedNote && $rootScope.selectedNote._id)
                            $rootScope.selectedNote.$get({username: $rootScope.currentUser});

                        form.$setPristine();

                        $rootScope.selectedNote = null;
                    };
                }
            })
    }]);