angular.module("notesApp")
    .directive("draggableZone", function () {

        return {

            link: function (scope, elem, attr) {
                var selectedElement = null;

                elem.on("mousedown", function (event) {

                    var parent = angular.element(event.target);

                    while (parent.length > 0) {
                        if (angular.element(parent).hasClass("note")) {
                            selectedElement = angular.element(parent);
                        }
                        parent = parent.parent();
                    }

                });

                elem.on("mouseup", function () {
                    selectedElement = null;
                });

                elem.on("mousemove", function (event) {

                    if (event.which == 1 && selectedElement) {
                        event.preventDefault();

                        selectedElement.css({
                            'position': 'absolute',
                            'top': (event.y - selectedElement[0].clientHeight / 2) + 'px',
                            'left': (event.x - selectedElement[0].clientWidth / 2) + 'px'
                        });

                    }

                });

            }
        }

    });