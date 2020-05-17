import './index.less';

import Camera from '../img/video_camera.png';
import Gear from '../img/gear.png';
import GearGlow from '../img/gear_glow.png';
import ZoomBtn from '../img/zoom_btn.png';
import ZoomHover from '../img/zoom_btn_hover.png';
import LinkingSound from '../audio/linking.wav';

let rotation = 0;
let isDragging = false;
let mousePosX, mousePosY;
let bodyWidth, bodyHeight;

const CAMERA_BACKGROUND_RATIO = 2;
const BACKGROUND_MOUSEMOVE = .004;
const BACKGROUND_DRAG = .1;

const ZOOM_STOPS = [200, 350, 650];
let currentZoom = 0;

$(document).ready(() => {
    const camera$ = $('#video-camera');
    const viewscreen$ = $('#viewscreen');
    const body$ = $('body');

    // Load assets dynamically
    function loadAsset(el$, asset) {
        el$.attr('src', asset);
    }
    loadAsset($('#camera-body'), Camera);
    loadAsset($('#gears img'), Gear);
    loadAsset($('#zoom-btn'), ZoomBtn);
    loadAsset($('#zoom-btn-hover'), ZoomHover);

    const linkingSound$ = $('#linking-sound');
    loadAsset(linkingSound$.find('source'), LinkingSound);

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
            scale *= ZOOM_STOPS[0] / ZOOM_STOPS[currentZoom];
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

        const backgroundScale = isDragging ? BACKGROUND_DRAG : BACKGROUND_MOUSEMOVE;
        const cameraScale = backgroundScale * CAMERA_BACKGROUND_RATIO;

        const {posX: camX, posY: camY} = getBackgroundPosition(viewscreen$);
        viewscreen$.css({
            'background-position-x': `${shiftViewParam(camX, deltaX, cameraScale)}%`,
            'background-position-y': `${shiftViewParam(camY, deltaY, cameraScale)}%`
        });

        camera$.css('transform', `rotateY(${-getRotation(camX, 10)}deg) rotateX(${getRotation(camY, 17)}deg) scale(1.1)`);

        const {posX: bodyX, posY: bodyY} = getBackgroundPosition(body$);
        body$.css({
            'background-position-x': `${shiftViewParam(bodyX, deltaX, backgroundScale)}%`,
            'background-position-y': `${shiftViewParam(bodyY, deltaY, backgroundScale)}%`
        });
    }

    function submitForm() {
        $('#sign-up').submit();
        $('#email').val('').trigger('input');

        const subscribed$ = $('#subscribed');
        subscribed$.animate(
            {opacity: 1, right: '-10px'},
            600,
            () => {
                setTimeout(() => {
                    subscribed$.animate(
                        {opacity: 0},
                        800,
                        () => subscribed$.css({right: '20px'})
                    );
                }, 1700);
            }
        );
    }

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
                .attr('src', `${isValidEmail ? GearGlow : Gear}`)
                .toggleClass('validated', isValidEmail);
        });

    $('#zoom').click(() => {
        currentZoom = (currentZoom + 1) % ZOOM_STOPS.length;
        viewscreen$.css('background-size', `${ZOOM_STOPS[currentZoom]}% auto`);
    });

    $(document).on('click', '#gears .validated', () => submitForm());

    viewscreen$.mousedown(() => isDragging = true);
    $('body')
        .mouseup(() => isDragging = false)
        .mousemove(({clientX, clientY}) => {
            shiftView(
                clientX - mousePosX,
                clientY - mousePosY,
            );

            mousePosX = clientX;
            mousePosY = clientY;
        });

    updateGears();
    setTimeout(() => $('#lower-third').animate({left: 0, opacity: 1}, 1500), 500);
});