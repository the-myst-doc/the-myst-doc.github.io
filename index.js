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

    function shiftView(deltaX, deltaY) {
        function shiftViewParam(param, delta, scale) {
            const updatedParam = param - (delta * scale);
            return Math.min(Math.max(0, updatedParam), 100); 
        }

        function getBackgroundPosition(el$) {
            return {
                posX: parseFloat(el$.css('background-position-x')),
                posY: parseFloat(el$.css('background-position-y')), 
            };
        }

        function getRotation(amount, max) {
            return (2 * max * (amount / 100)) - max;
        }

        const VIEWSCREEN_SCALE = .1;
        const {posX: viewX, posY: viewY} = getBackgroundPosition(viewscreen$);
        viewscreen$.css({
            'background-position-x': `${shiftViewParam(viewX, deltaX, VIEWSCREEN_SCALE)}%`,
            'background-position-y': `${shiftViewParam(viewY, deltaY, VIEWSCREEN_SCALE)}%`
        });

        camera$.css('transform', `rotateY(${-getRotation(viewX, 10)}deg) rotateX(${getRotation(viewY, 17)}deg) scale(1.1)`);

        const BODY_SCALE = .025;
        const {posX: bodyX, posY: bodyY} = getBackgroundPosition(body$);
        body$.css({
            'background-position-x': `${shiftViewParam(bodyX, deltaX, BODY_SCALE)}%`,
            'background-position-y': `${shiftViewParam(bodyY, deltaY, BODY_SCALE)}%`
        });
    }

    function isTesting() {
        return (['localhost', '127.0.0.1', ''].includes(location.hostname))
    }

    $('#email')
        .keydown(() => {
            updateGears();
        })
        .on('input', (e) => {
            const emailText = $(e.target).val();
            const isValidEmail = emailText.match(/^[\w\.]+@\w+\.\w{3}$/g) || false;
            $('#gears').toggleClass('validated', isValidEmail);
        });

    $('#gears.validated').click(() => {
        $('#footer form').submit();
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
            shiftView(
                e.clientX - mousePosX,
                e.clientY - mousePosY,
            );

            mousePosX = e.clientX;
            mousePosY = e.clientY;
        });

    updateGears();
});