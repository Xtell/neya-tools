document.addEventListener( 'DOMContentLoaded', function () {

    /* Main slider */
    new Splide( '.main-slider.splide', {
        arrows: false,
        autoplay: true,
        loop: true,
        perPage: 1,
    } ).mount();

    /* Partners slider */
    new Splide( '.partners-slider.splide', {
        perPage: 3,
    } ).mount();

} );

