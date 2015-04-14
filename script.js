+function($) {

    var app = function(){};

    app.initialise = function() {
        $('body').addClass('loaded');

        $('a#games').on('click', function(evt) {
            evt.preventDefault();
            $('#games-list').toggleClass('hidden');
            $('.arrow').toggleClass('rotate-90');
        });

    }

    // Call initialise
    app.initialise();

}(jQuery, undefined);