import './index.less';

import Camera from '../img/video_camera.png';
import Gear from '../img/gear.png';
import GearGlow from '../img/gear_glow.png';
import ZoomBtn from '../img/zoom_btn.png';
import ZoomHover from '../img/zoom_btn_hover.png';
import LinkingSound from '../audio/linking.wav';

let rotation = 0;
let clicked = false;
let mousePosX, mousePosY;
let bodyWidth, bodyHeight;

const VIEWSCREEN_SCALE = .045;
const BODY_SCALE = .03;

const ZOOM_STOPS = [200, 350, 650];
let currentZoom = 0;

$(document).ready(() => {
    const camera$ = $('#video-camera');
    const viewscreen$ = $('#viewscreen');
    const body$ = $('body');

    // Load assets dynamically
    $('#camera-body').attr('src', Camera);
    $('#gears img').attr('src', Gear);
    $('#zoom-btn').attr('src', ZoomBtn);
    $('#zoom-btn-hover').attr('src', ZoomHover);

    const linkingSound$ = $('#linking-sound');
    linkingSound$.find('source').attr('src', LinkingSound);

    const soundElement = linkingSound$.get(0);
    soundElement.load();
    soundElement.volume = 0.1;

    function updateGears() {
        rotation += 15;
        $('#big-gear').css('transform', `translateY(-50%) rotate(${rotation}deg)`);
        $('#small-gear').css('transform', `translateY(-50%) rotate(${20-rotation}deg)`);
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

        const {posX: viewX, posY: viewY} = getBackgroundPosition(viewscreen$);
        viewscreen$.css({
            'background-position-x': `${shiftViewParam(viewX, deltaX, VIEWSCREEN_SCALE)}%`,
            'background-position-y': `${shiftViewParam(viewY, deltaY, VIEWSCREEN_SCALE)}%`
        });

        camera$.css('transform', `rotateY(${-getRotation(viewX, 10)}deg) rotateX(${getRotation(viewY, 17)}deg) scale(1.1)`);

        const {posX: bodyX, posY: bodyY} = getBackgroundPosition(body$);
        body$.css({
            'background-position-x': `${shiftViewParam(bodyX, deltaX, BODY_SCALE)}%`,
            'background-position-y': `${shiftViewParam(bodyY, deltaY, BODY_SCALE)}%`
        });
    }

    function submitForm() {
        $('#sign-up').submit();
        $('#email').val('').trigger('input');

        const subscribed$ = $('#subscribed');
        subscribed$.animate(
            {opacity: 1, bottom: '66px'},
            400,
            () => {
                setTimeout(() => {
                    subscribed$.animate(
                        {opacity: 0},
                        800,
                        () => subscribed$.css({bottom: '46px'})
                    );
                }, 1700);
            }
        );
    }

    viewscreen$.click(() => {
        soundElement.play();
    });

    $('#email')
        .keydown((e) => {
            if (e.which === 13) {
                e.preventDefault();
                submitForm();
            } else {
                updateGears();
            }
        })
        .on('input', (e) => {
            const emailText = $(e.target).val();
            const isValidEmail = emailText.match(/^[\w\.]+@\w+\.\w{3}$/g) || false;
            $('#big-gear, #small-gear')
                .attr('src', isValidEmail ? GearGlow : Gear)
                .toggleClass('validated', isValidEmail);
        });

    $('#zoom').click(() => {
        currentZoom = (currentZoom + 1) % ZOOM_STOPS.length;
        viewscreen$.css('background-size', `${ZOOM_STOPS[currentZoom]}% auto`);
    });

    $(document).on('click', '#gears .validated', () => submitForm());

    $('body').mousemove((e) => {
        if (window.matchMedia('(max-device-width: 850px)').matches) {
            return;
        }

        shiftView(
            e.clientX - mousePosX,
            e.clientY - mousePosY,
        );

        mousePosX = e.clientX;
        mousePosY = e.clientY;
    });

    updateGears();
});