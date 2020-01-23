$(document).ready(() => {
    let rotation = 0;
    function updateGears() {
        rotation += 15;
        $('#big-gear').css('transform', `rotate(${rotation}deg)`);
        $('#small-gear-1, #small-gear-2').css('transform', `rotate(${30-rotation}deg)`);
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

    $('#gears img').click((e) => {
        if ($('#gears').hasClass('validated')) {
            window.location = 'https://philipshane.squarespace.com/';
        }
    });

    updateGears();
});