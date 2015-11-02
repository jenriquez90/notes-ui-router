angular.module("notesApp.notes", ["ui.router", "notesApp.notes.service"])
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('all', {

                url: '/allNotes',

                templateUrl: "../partialViews/noteTemplate.html",

                resolve: {
                    allNotes: ["notesResource", "$rootScope", function (notesResource, $rootScope) {
                        return notesResource.query({username: $rootScope.currentUser});
                    }]
                },
                controller: function ($scope, $location, $rootScope, allNotes, notesResource, $state) {

                    $scope.modalMode = "Update";

                    allNotes.$promise.then(function (data) {
                        $scope.notes = data;
                    });

                    $scope.deleteNote = function (note, $event) {

                        $event.stopPropagation();

                        if (confirm("Are you sure you want to delete this note?")) {
                            note.$remove({username: $rootScope.currentUser}, function (data) {
                                for (var i = 0; i < $scope.notes.length; i++) {
                                    if ($scope.notes[i]._id == data._id) {
                                        $scope.notes.splice(i, 1);
                                        break;
                                    }
                                }

                            });
                        }
                    };

                    $scope.editNote = function (note) {
                        $rootScope.selectedNote = note;
                    };

                    $scope.loadAllNotes = function () {
                        notesResource.query({username: $rootScope.currentUser}).$promise.then(function (notes) {
                            $scope.notes = notes;
                        });
                    };

                }

            })

    }]);

