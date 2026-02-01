/* ===================================
   SLIDER FUNCTIONALITY
   Using Swiper.js for all carousels
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // Hero Slider
    const heroSwiper = new Swiper('.hero-swiper', {
        loop: true,
        speed: 800,
        effect: 'fade',
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
    
    // Most Loved Products Slider
    const mostLovedSwiper = new Swiper('#mostLovedSwiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        slidesPerGroup: 4,
        speed: 600,
        navigation: {
            nextEl: '#mostLovedNext',
            prevEl: '#mostLovedPrev',
        },
        breakpoints: {
            480: {
                slidesPerView: 2,
                slidesPerGroup: 2,
            },
            768: {
                slidesPerView: 3,
                slidesPerGroup: 3,
            },
            1024: {
                slidesPerView: 4,
                slidesPerGroup: 4,
            },
        },
    });
    
    // Bestsellers Slider
    const bestsellersSwiper = new Swiper('#bestsellersSwiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        slidesPerGroup: 4,
        speed: 600,
        navigation: {
            nextEl: '#bestsellersNext',
            prevEl: '#bestsellersPrev',
        },
        breakpoints: {
            480: {
                slidesPerView: 2,
                slidesPerGroup: 2,
            },
            768: {
                slidesPerView: 3,
                slidesPerGroup: 3,
            },
            1024: {
                slidesPerView: 4,
                slidesPerGroup: 4,
            },
        },
    });
    
    // Product Detail Image Gallery (if exists)
    const galleryThumbs = new Swiper('.gallery-thumbs', {
        spaceBetween: 10,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesProgress: true,
        direction: 'vertical',
    });
    
    const galleryMain = new Swiper('.gallery-main', {
        spaceBetween: 10,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        thumbs: {
            swiper: galleryThumbs,
        },
    });
    
    // Similar Products Slider (Product Detail Page)
    const similarSwiper = new Swiper('#similarSwiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        slidesPerGroup: 4,
        speed: 600,
        navigation: {
            nextEl: '#similarNext',
            prevEl: '#similarPrev',
        },
        breakpoints: {
            480: {
                slidesPerView: 2,
                slidesPerGroup: 2,
            },
            768: {
                slidesPerView: 3,
                slidesPerGroup: 3,
            },
            1024: {
                slidesPerView: 4,
                slidesPerGroup: 4,
            },
        },
    });
    
    // Customer Reviews Carousel
    const reviewsSwiper = new Swiper('.reviews-swiper', {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.reviews-swiper .swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
            },
        },
    });
    
    console.log('Sliders initialized successfully!');
});