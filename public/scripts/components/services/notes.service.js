angular.module("notesApp.notes.service", ["ngResource"])
    .constant("notesUrl", "http://localhost:8000/main/:username/notes")
    .factory("notesResource", function (notesUrl, $resource) {
        return $resource(notesUrl + "/:noteId", {noteId: "@_id"})
    });