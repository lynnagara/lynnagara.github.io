+function($) {

    var app = function(){};

    // Detect request animation frame
    var scroll = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        function(callback){ window.setTimeout(callback, 1000/60) }; // IE Fallback

    app.animations = [
        {
            'selector': $('#letter-1'),
            'translateY': 100,
            'translateX': 100
        }
    ];


    app.initialise = function() {
        // Set element heights
        $('body').height(window.innerHeight * 4);
        $('#page-1').height(window.innerHeight);
        $('body').addClass('loaded');

        // Kick off the loop
        app.loop();
    }

    app.loop = function() {
        // Animate elements
        var top = window.pageYOffset;
        var animation, translateY, translateX, scale, rotate, opacity;
        var i;

        for (i=0;i<app.animations.length;i++) {
            console.log(app.animations[i].selector)
        }
        debugger;

        $('#letter-1').css({
            'transform': 'translate3d(-80px, ' +  app.animations[0].translateY + 'px, 0) scale(2) rotate(-23deg)',
            'opacity': 0.5
        });


        // Loop
        scroll(app.loop);
    }

    // Call initialise
    app.initialise();

}(jQuery, undefined);