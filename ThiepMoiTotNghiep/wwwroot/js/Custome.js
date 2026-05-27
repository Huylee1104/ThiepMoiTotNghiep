// ===== CAROUSEL =====
(function () {
    const track = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('carouselDots');
    if (!track) return;

    const slides = Array.from(track.children);
    const total = slides.length;
    let current = 0;
    let autoTimer = null;
    let isTransitioning = false;

    function visibleCount() {
        return window.innerWidth <= 768 ? 1 : 3;
    }

    // Clone slides đầu & cuối để tạo hiệu ứng vòng lặp liền mạch
    function buildInfiniteTrack() {
        // Xóa clone cũ nếu có
        track.querySelectorAll('.carousel-clone').forEach(el => el.remove());

        const vc = visibleCount();
        // Clone cuối thêm vào đầu
        for (let i = total - 1; i >= total - vc; i--) {
            const clone = slides[i].cloneNode(true);
            clone.classList.add('carousel-clone');
            track.prepend(clone);
        }
        // Clone đầu thêm vào cuối
        for (let i = 0; i < vc; i++) {
            const clone = slides[i].cloneNode(true);
            clone.classList.add('carousel-clone');
            track.append(clone);
        }
    }

    function allSlides() { return Array.from(track.children); }

    function slideWidth() {
        const vc = visibleCount();
        return 100 / vc;
    }

    function getOffset() {
        const vc = visibleCount();
        // current + vc (vì có vc clone ở đầu)
        return -(current + vc) * slideWidth();
    }

    function setTransition(on) {
        track.style.transition = on
            ? 'transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            : 'none';
    }

    function goTo(index, animate) {
        setTransition(animate !== false);
        track.style.transform = `translateX(${-(index + visibleCount()) * slideWidth()}%)`;
    }

    function updateDots() {
        Array.from(dotsContainer.children).forEach((dot, i) => {
            dot.classList.toggle('active', i === ((current % total + total) % total));
        });
    }

    function buildDots() {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Hình ' + (i + 1));
            dot.addEventListener('click', () => carouselMoveTo(i));
            dotsContainer.appendChild(dot);
        }
    }

    function init() {
        buildInfiniteTrack();
        buildDots();
        // Set slide width cho tất cả
        Array.from(track.children).forEach(s => {
            s.style.flex = '0 0 ' + slideWidth() + '%';
        });
        setTransition(false);
        goTo(0, false);
        updateDots();
        startAuto();
    }

    function move(dir) {
        if (isTransitioning) return;
        isTransitioning = true;
        current += dir;
        goTo(current, true);
    }

    // Xử lý vòng lặp sau khi transition kết thúc
    track.addEventListener('transitionend', () => {
        const vc = visibleCount();
        if (current >= total) {
            current = 0;
            setTransition(false);
            track.style.transform = `translateX(${-(current + vc) * slideWidth()}%)`;
        } else if (current < 0) {
            current = total - 1;
            setTransition(false);
            track.style.transform = `translateX(${-(current + vc) * slideWidth()}%)`;
        }
        updateDots();
        isTransitioning = false;
    });

    function startAuto() {
        clearInterval(autoTimer);
        autoTimer = setInterval(() => move(1), 5000);
    }

    // Public: nút mũi tên
    window.carouselMove = function (dir) {
        move(dir);
        startAuto(); // reset timer khi bấm tay
    };

    window.carouselMoveTo = function (index) {
        if (isTransitioning) return;
        isTransitioning = true;
        current = index;
        goTo(current, true);
        startAuto();
    };

    // Rebuild khi đổi orientation / resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            current = 0;
            init();
        }, 200);
    });

    init();
})();

// ===== END CAROUSEL =====

$(document).ready(function () {
    $('#guestImage').attr('src', '/img/anhhuy.png');
    nameModal = new bootstrap.Modal(document.getElementById('nameModal'));
    attendanceModal = new bootstrap.Modal(document.getElementById('attendanceModal'));

    nameModal.show();
});

function submitName() {
    var rawName = $('#guestNameInput').val().trim();
    if (rawName === "") {
        $('#nameError').show();
        return;
    }
    $('#nameError').hide();

    // Disable nút + hiện spinner
    var $btn = $('button[onclick="submitName()"]');
    $btn.prop('disabled', true)
        .html('<span class="spinner-border spinner-border-sm me-2" role="status"></span>Đang tải...');

    $.post('/Home/CheckGuest', { rawName: rawName }, function (data) {
        currentGuestId = data.id;
        currentGuestName = data.displayName;
        if (data.image && data.image !== "") {
            $('#guestImage').attr('src', data.image);
        } else {
            $('#guestImage').attr('src', '/img/anhhuy.png');
        }
        $('#welcomeTextName').text(currentGuestName);
        $('#participationTextName').text(currentGuestName);
        nameModal.hide();

        $btn.prop('disabled', false).html('Xác Nhận');
    }).fail(function () {
        $btn.prop('disabled', false).html('Xác Nhận');
    });
}

function submitAttendance(isAttending) {
    $.post('/Home/UpdateAttendance', { id: currentGuestId, isAttending: isAttending }, function () {
        attendanceModal.hide();
        if (isAttending) {
            $('#btnPrint').show(); 
            var toastEl = document.getElementById('liveToast');
            var toast = new bootstrap.Toast(toastEl);
            toast.show();
        }
    });
}

let musicPausedByVideo = false;

function toggleVideo() {
    const video = document.getElementById('ceremonyVideo');
    const icon = document.getElementById('videoToggleIcon');
    const audio = document.getElementById('bg-music');

    if (video.paused) {
        // Bắt đầu phát video
        if (!audio.paused) {
            // Nhạc đang chạy → dừng và đánh dấu
            audio.pause();
            musicPausedByVideo = true;
            // Cập nhật UI nút nhạc
            document.getElementById('music-btn').classList.remove('playing');
            document.getElementById('music-icon').className = 'bi bi-music-note-beamed';
            document.getElementById('music-btn').title = 'Bật nhạc nền';
        }
        video.play();
        icon.className = 'bi bi-pause-fill';
    } else {
        // Dừng video
        video.pause();
        icon.className = 'bi bi-play-fill';
        // Nếu nhạc bị dừng bởi video thì khôi phục
        if (musicPausedByVideo) {
            audio.play();
            musicPausedByVideo = false;
            document.getElementById('music-btn').classList.add('playing');
            document.getElementById('music-icon').className = 'bi bi-music-note-list';
            document.getElementById('music-btn').title = 'Tắt nhạc nền';
        }
    }
}

function toggleMusic() {
    const audio = document.getElementById('bg-music');
    const btn = document.getElementById('music-btn');
    const icon = document.getElementById('music-icon');

    if (audio.paused) {
        audio.play();
        btn.classList.add('playing');
        icon.className = 'bi bi-music-note-list';
        btn.title = 'Tắt nhạc nền';
        // Nếu người dùng tự bật lại nhạc thì bỏ cờ
        musicPausedByVideo = false;
    } else {
        audio.pause();
        btn.classList.remove('playing');
        icon.className = 'bi bi-music-note-beamed';
        btn.title = 'Bật nhạc nền';
    }
}

function printInvitation() {
    const url = '/Home/GeneratePdf?id=' + currentGuestId + '&displayName=' + encodeURIComponent(currentGuestName);
    window.open(url, '_blank');
}