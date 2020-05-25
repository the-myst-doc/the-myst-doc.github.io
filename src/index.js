import './index.less';

import Camera from '../img/video_camera.png';
import Gear from '../img/gear.png';
import GearGlow from '../img/gear_glow.png';
import ZoomBtn from '../img/zoom_btn.png';
import ZoomHover from '../img/zoom_btn_hover.png';
import LinkingSound from '../audio/linking.wav';
import LinkingPanel from '../video/red_panel.mov';

let rotation = 0;
let isDragging = false, isValidEmail = false;;
let mousePosX, mousePosY;
let bodyWidth, bodyHeight;

const CAMERA_BACKGROUND_RATIO = 2;
const BACKGROUND_MOUSEMOVE = .004;
const BACKGROUND_DRAG = .1;

const ZOOM_STOPS = [200, 350, 650];
let currentZoom = 0;

const isMobile = () => Boolean(window.matchMedia("only screen and (max-device-width: 850px)").matches);
const randFloat = (center, magnitude) => center + (Math.random() - 0.5) * magnitude;

$(document).ready(() => {
    const camera$ = $('#video-camera');
    const viewscreen$ = $('#viewer');
    const body$ = $('#content');
    const linkingTitle$ = $('#linking-title');
    const linkingPanel$ = $('#linking-panel');
    const zoomBtn$ = $('#zoom');

    // Load assets dynamically
    function loadAsset(el$, asset) {
        el$.attr('src', asset);
    }
    loadAsset($('#camera-body'), Camera);
    loadAsset($('#gears img'), Gear);
    loadAsset($('#zoom-btn'), ZoomBtn);
    loadAsset($('#zoom-btn-hover'), ZoomHover);
    loadAsset($('#linking-panel source'), LinkingPanel);

    const linkingSound$ = $('#linking-sound');
    loadAsset(linkingSound$.find('source'), LinkingSound);

    const soundElement = linkingSound$.get(0);
    soundElement.load();
    soundElement.volume = 0.08;

    function updateGears() {
        rotation += 15;
        $('#big-gear').css('transform', `translateY(-50%) rotate(${rotation}deg)`);
        $('#small-gear').css('transform', `translateY(-50%) rotate(${20-rotation}deg)`);
    }

    function shakeLinkingPanel() {
        const SHAKE_MAGNITUDE = 2.5;
        const SHAKE_CENTER = 50;
        const SHAKE_INTERVAL = 300;

        linkingTitle$.css({
            top: `${randFloat(SHAKE_CENTER, SHAKE_MAGNITUDE)}%`,
            left: `${randFloat(SHAKE_CENTER, SHAKE_MAGNITUDE)}%`,
            'font-size': `${randFloat(7, 1.3)}vh`,
            'letter-spacing': `${randFloat(0, 4)}px`
        });

        setTimeout(shakeLinkingPanel, SHAKE_INTERVAL);
    }

    function showLinkingPanel() {
        if (linkingTitle$.css('display') !== 'none') {
            return;
        }

        soundElement.play();

        const FADE_IN_DURATION = 1600;
        linkingTitle$.add(linkingPanel$).css({display: 'block'});
        linkingPanel$.animate({opacity: 1}, FADE_IN_DURATION).get(0).play();
        setTimeout(() => linkingTitle$.animate({opacity: 0.7}, FADE_IN_DURATION), 500);

        zoomBtn$.hide();

        shakeLinkingPanel();
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

        camera$.css('transform', `rotateY(${-getRotation(camX, 5)}deg) rotateX(${getRotation(camY, 12)}deg)`);

        const {posX: bodyX, posY: bodyY} = getBackgroundPosition(body$);
        body$.css({
            'background-position-x': `${shiftViewParam(bodyX, deltaX, backgroundScale)}%`,
            'background-position-y': `${shiftViewParam(bodyY, deltaY, backgroundScale)}%`
        });
    }

    function submitForm() {
        if (!isValidEmail) {
            return;
        }

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
                    showLinkingPanel();
                }, 1200);
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
            isValidEmail = emailText.match(/^[\w\.]+@\w+\.\w{3}$/g) || false;
            $('#big-gear, #small-gear')
                .attr('src', `${isValidEmail ? GearGlow : Gear}`)
                .toggleClass('validated', isValidEmail);
        });

    zoomBtn$.click(() => {
        currentZoom = (currentZoom + 1) % ZOOM_STOPS.length;
        viewscreen$.css('background-size', `${ZOOM_STOPS[currentZoom]}% auto`);
    });

    $(document).on('click', '#gears .validated', () => submitForm());

    viewscreen$.mousedown(() => isDragging = true);
    $('body')
        .mouseup(() => isDragging = false)
        .mousemove(({clientX, clientY}) => {
            if (isMobile() && !isDragging) {
                return;
            }

            shiftView(
                clientX - mousePosX,
                clientY - mousePosY,
            );

            mousePosX = clientX;
            mousePosY = clientY;
        });

    $('.social').clone().prependTo('#mobile-footer');

    updateGears();
    setTimeout(() => $('#lower-third').animate({left: 0, opacity: 1}, 1500), 500);
});