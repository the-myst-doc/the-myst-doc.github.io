let rotation = 0;
let clicked = false;
let mousePosX, mousePosY;
let bodyWidth, bodyHeight;

$(document).ready(() => {
    const camera$ = $('#video-camera');
    const viewscreen$ = $('#viewscreen');
    const body$ = $('body');
    const blurbs$ = $('#blurbs');

    function updateGears() {
        rotation += 15;
        $('#big-gear').css('transform', `translateY(-50%) rotate(${rotation}deg)`);
        $('#small-gear').css('transform', `translateY(-50%) rotate(${5-rotation}deg)`);
    }

    function updateCamera(top, left) {
        camera$.css({
            left: `+=${left}`,
            top: `+=${top}`,
        });

        updateViewScreen();
    }

    function updateBody() {
        bodyWidth = body$.width();
        bodyHeight = body$.height();
    }

    function updateViewScreen() {
        const {left: cameraLeft, top: cameraTop} = camera$.offset();
        const calculatedHeight = 0.75 * bodyWidth;
        const calculatedWidth = bodyHeight / 0.75;

        if (calculatedHeight > bodyHeight) {
            const verticalOffset = (calculatedHeight - bodyHeight) / 2;
            viewscreen$.css({
                'background-size': `${bodyWidth}px auto`,
                'background-position': `${-280-cameraLeft}px ${-190-verticalOffset-cameraTop}px`
            });
        } else {
            const horizontalOffset = (calculatedWidth - bodyWidth) / 2;
            viewscreen$.css({
                'background-size': `auto ${bodyHeight}px`,
                'background-position': `${-280-horizontalOffset-cameraLeft}px ${-190-cameraTop}px`
            });
        }

        blurbs$.css('opacity', 3 * (cameraTop-120) / bodyHeight);
    }

    function isTesting() {
        return (['localhost', '127.0.0.1', ''].includes(location.hostname))
    }

    updateBody();
    updateViewScreen();

    $(window).resize(() => {
        updateBody();
        updateViewScreen();
    })

    $('#email')
        .keydown(() => {
            updateGears();
        })
        .on('input', (e) => {
            const emailText = $(e.target).val();
            const isValidEmail = emailText.match(/^[\w\.]+@\w+\.\w{3}$/g) || false;
            $('#gears').toggleClass('validated', isValidEmail);
        });

    $('#gears img').click((e) => {
        if ($('#gears').hasClass('validated')) {
            window.location = 'https://philipshane.squarespace.com/';
        }
    });

    // $('#footer').submit((e) => {
    //     if (!isTesting()) {
    //         e.preventDefault();
    //         $.ajax({
    //             url: 'https://PhilipShane.us3.list-manage.com/subscribe/post-json&c=?',
    //             type: 'POST',
    //             data: $('#footer form').serialize(),
    //             dataType: 'jsonp',
    //             success: () => console.log('subscribed!')
    //         });
    //     }
    // });

    camera$.mousedown((e) => {
        e.preventDefault();
        clicked = true;
        mousePosX = e.clientX;
        mousePosY = e.clientY;
    });

    $('body')
        .mouseup(() => clicked = false)
        .mousemove((e) => {
            if (!clicked) return;

            updateCamera(
                e.clientY - mousePosY,
                e.clientX - mousePosX,
            );

            mousePosX = e.clientX;
            mousePosY = e.clientY;
        });

    $(window).on('mousewheel', (e) => {
        const delta = e.originalEvent.wheelDelta * .1;
        updateCamera(delta, 0);
    });

    updateGears();
});