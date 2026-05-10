(function () {
    "use strict";

    /* ------------------------------------------------------------------
       1. DANH SÁCH ẢNH — chỉnh sửa mảng này để thêm/bớt ảnh
          Đường dẫn tương đối từ wwwroot trong ASP.NET Core
       ------------------------------------------------------------------ */
    const albumImages = [
        "/img/album/1.jpg",
        "/img/album/2.jpg",
        "/img/album/3.jpg",
        "/img/album/4.jpg",
        "/img/album/5.jpg",
        "/img/album/6.jpg",
        "/img/album/7.jpg",
        "/img/album/8.jpg",
        "/img/album/9.jpg",
        "/img/album/10.jpg",
    ];

    /* ------------------------------------------------------------------
       2. THAM CHIẾU DOM
       ------------------------------------------------------------------ */
    const modal = document.getElementById("albumModal");
    const btnOpen = document.getElementById("btnAlbum");
    const btnClose = document.getElementById("btnCloseAlbum");
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");
    const container = document.getElementById("flipbookContainer");
    const loading = document.getElementById("albumLoading");
    const pageInfo = document.getElementById("albumPageInfo");
    const footer = document.getElementById("albumFooter");

    /* ------------------------------------------------------------------
       3. TÍNH KÍCH THƯỚC FLIPBOOK PHÙ HỢP VỚI MÀN HÌNH
          - Desktop: hiển thị 2 trang → width = 2 × pageW
          - Mobile (≤ 640px): 1 trang
       ------------------------------------------------------------------ */
    function getFlipbookSize() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const isMobile = vw <= 640;

        // Chiều cao tối đa 75% viewport, tối thiểu 280px
        const pageH = Math.min(Math.max(Math.floor(vh * 0.72), 280), 640);
        // Tỉ lệ trang 3:4 (portrait, phù hợp ảnh tốt nghiệp)
        const pageW = Math.floor(pageH * 0.72);

        return { pageW, pageH, isMobile };
    }

    /* ------------------------------------------------------------------
       4. TẠO CÁC TRANG HTML AN TOÀN (không dùng innerHTML bừa)
          Mỗi ảnh → 1 div.album-page chứa <img>
       ------------------------------------------------------------------ */
    function buildPages() {
        // Xóa trang cũ (trừ loading spinner)
        const oldPages = container.querySelectorAll(".album-page");
        oldPages.forEach(p => p.remove());

        const { pageW, pageH } = getFlipbookSize();

        // — Trang bìa trước (index 0) —
        const coverFront = document.createElement("div");
        coverFront.className = "album-page page-cover-front";
        coverFront.style.cssText = `width:${pageW}px;height:${pageH}px;position:relative;`;

        const ornament = document.createElement("div");
        ornament.className = "cover-ornament";
        ornament.textContent = "✦";

        const covTitle = document.createElement("div");
        covTitle.className = "cover-title";
        covTitle.textContent = "Kỷ Niệm Tốt Nghiệp";

        const covSub = document.createElement("div");
        covSub.className = "cover-subtitle";
        covSub.textContent = "Graduation Album";

        const covYear = document.createElement("div");
        covYear.className = "cover-year";
        covYear.textContent = new Date().getFullYear();

        const ornament2 = document.createElement("div");
        ornament2.className = "cover-ornament";
        ornament2.textContent = "✦";

        ["orn-tl", "orn-tr", "orn-bl", "orn-br"].forEach(cls => {
            const c = document.createElement("div");
            c.className = "cover-ornament-corner " + cls;
            c.textContent = "✦";
            coverFront.appendChild(c);
        });

        function makeDots() {
            const row = document.createElement("div");
            row.className = "cover-dots";
            for (let i = 0; i < 5; i++) {
                const s = document.createElement("span");
                row.appendChild(s);
            }
            return row;
        }
        function makeDivider() {
            const d = document.createElement("div");
            d.className = "cover-divider";
            d.innerHTML = `<div class="cover-divider-line"></div>
                   <span class="cover-divider-diamond">◆</span>
                   <div class="cover-divider-line"></div>`;
            return d;
        }

        coverFront.append(
            ornament,
            makeDivider(),
            covTitle,
            covSub,
            makeDots(),
            covYear,
            makeDivider(),
            ornament2 
        );

        container.appendChild(coverFront);

        // — Các trang ảnh —
        albumImages.forEach((src) => {
            const page = document.createElement("div");
            page.className = "album-page";
            page.style.cssText = `width:${pageW}px;height:${pageH}px;`;

            const bgImg = document.createElement("img");
            bgImg.src = src;
            bgImg.className = "album-page-bg";
            bgImg.draggable = false;
            bgImg.setAttribute("aria-hidden", "true");

            const img = document.createElement("img");
            img.src = src;
            img.alt = "Ảnh album tốt nghiệp";
            img.draggable = false;
            img.loading = "eager";

            page.appendChild(bgImg);
            page.appendChild(img);
            container.appendChild(page);
        });

        // — Trang bìa sau (cuối cùng) —
        const coverBack = document.createElement("div");
        coverBack.className = "album-page page-cover-back";
        coverBack.style.cssText = `width:${pageW}px;height:${pageH}px;position:relative;`;

        const backInner = document.createElement("div");
        backInner.className = "cover-back-inner";

        const backOrnTop = document.createElement("div");
        backOrnTop.className = "cover-ornament";
        backOrnTop.textContent = "✦";

        const backMsg = document.createElement("p");
        backMsg.className = "cover-back-message";
        backMsg.textContent = "Mình thực sự rất vui vì sự có mặt của các bạn, điều đó làm cho buổi tốt nghiệp của mình càng thêm ý nghĩa và đáng nhớ.";

        const backWish = document.createElement("p");
        backWish.className = "cover-back-wish";
        backWish.textContent = "Xin chúc tất cả các bạn gặp nhiều thành công trong cuộc sống, sức khỏe dồi dào, công việc hanh thông và gặp được nhiều may mắn.";

        const backFin = document.createElement("div");
        backFin.className = "cover-back-fin";
        backFin.textContent = "✦  Fin  ✦";

        backInner.append(backOrnTop, backMsg, backWish, backFin);
        coverBack.appendChild(backInner);
        container.appendChild(coverBack);
    }

    /* ------------------------------------------------------------------
       5. DOT NAVIGATOR — render lại mỗi khi số trang thay đổi
       ------------------------------------------------------------------ */
    let pageFlip = null;  // instance StPageFlip

    function buildDots(totalPages) {
        footer.innerHTML = "";
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement("button");
            dot.className = "dot" + (i === 0 ? " active" : "");
            dot.setAttribute("aria-label", `Đến trang ${i + 1}`);
            dot.addEventListener("click", () => {
                if (pageFlip) pageFlip.flip(i);
            });
            footer.appendChild(dot);
        }
    }

    function updateDots(pageIndex) {
        const dots = footer.querySelectorAll(".dot");
        dots.forEach((d, i) => d.classList.toggle("active", i === pageIndex));
    }

    function updatePageInfo(current, total) {
        pageInfo.textContent = `Trang ${current + 1} / ${total}`;
    }

    /* ------------------------------------------------------------------
       6. KHỞI TẠO STPAGEFLIP
       ------------------------------------------------------------------ */
    let isInitialized = false;

    function initFlipbook() {
        const { pageW, pageH, isMobile } = getFlipbookSize();

        // Tính tổng chiều rộng container:
        // - desktop: 2 trang
        // - mobile:  1 trang
        const displayW = isMobile ? pageW : pageW * 2;
        container.style.width = displayW + "px";
        container.style.height = pageH + "px";

        // Xây dựng trang DOM trước
        buildPages();

        const totalPages = container.querySelectorAll(".album-page").length;
        buildDots(totalPages);

        // Khởi tạo StPageFlip
        pageFlip = new St.PageFlip(container, {
            width: pageW,
            height: pageH,
            size: "fixed",
            minWidth: pageW,
            maxWidth: pageW,
            minHeight: pageH,
            maxHeight: pageH,
            showCover: true,
            flippingTime: 800,
            usePortrait: isMobile,
            singlePage: isMobile,        // ← thêm
            startPage: 0,
            drawShadow: true,
            maxShadowOpacity: 0.6,
            autoSize: false,
            mobileScrollSupport: false,  // giữ 1 lần
            swipeDistance: isMobile ? 30 : 50,  // giữ 1 lần
            clickEventForward: true,
            useMouseEvents: true,
        });

        // Load tất cả .album-page vào StPageFlip
        pageFlip.loadFromHTML(container.querySelectorAll(".album-page"));

        // Cập nhật UI khi lật trang
        pageFlip.on("flip", (e) => {
            updateDots(e.data);
            updatePageInfo(e.data, totalPages);
            preloadNearby(e.data);
        });

        // Ẩn loading spinner sau khi render xong
        pageFlip.on("init", () => {
            setTimeout(() => {
                loading.classList.add("hidden");
                updatePageInfo(0, totalPages);
            }, 300);
        });

        isInitialized = true;
    }

    /* ------------------------------------------------------------------
       7. MỞ MODAL
       ------------------------------------------------------------------ */
    function openModal() {
        modal.classList.add("is-open");
        document.body.style.overflow = "hidden";

        if (!isInitialized) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {   // ← double rAF
                    setTimeout(initFlipbook, 80);
                });
            });
        } else {
            loading.classList.add("hidden");
            if (pageFlip) pageFlip.turnToPage(0);
        }
    }

    /* ------------------------------------------------------------------
       8. ĐÓNG MODAL — fade out nhẹ
       ------------------------------------------------------------------ */
    function closeModal() {
        modal.classList.remove("is-open");
        document.body.style.overflow = "";
    }

    /* ------------------------------------------------------------------
       9. EVENT LISTENERS
       ------------------------------------------------------------------ */
    btnOpen.addEventListener("click", openModal);
    btnClose.addEventListener("click", closeModal);

    // Đóng khi click nền tối (không phải flipbook)
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    // Phím ESC để đóng
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) {
            closeModal();
        }
        // Phím mũi tên để lật trang
        if (!pageFlip) return;
        if (e.key === "ArrowRight") pageFlip.flipNext();
        if (e.key === "ArrowLeft") pageFlip.flipPrev();
    });

    // Nút prev / next
    btnPrev.addEventListener("click", () => { if (pageFlip) pageFlip.flipPrev(); });
    btnNext.addEventListener("click", () => { if (pageFlip) pageFlip.flipNext(); });

    /* ------------------------------------------------------------------
       10. RESIZE — tái khởi tạo flipbook khi đổi kích thước màn hình
           (ví dụ: xoay điện thoại)
           Dùng debounce để tránh gọi liên tục
       ------------------------------------------------------------------ */
    let resizeTimer;
    window.addEventListener("resize", () => {
        if (!modal.classList.contains("is-open")) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Destroy instance cũ rồi init lại
            if (pageFlip) {
                pageFlip.destroy();
                pageFlip = null;
                isInitialized = false;
                loading.classList.remove("hidden");
            }
            initFlipbook();
        }, 300);
    });

    function preloadNearby(currentIndex) {
        // currentIndex là index trang flip, trừ 1 vì trang 0 là cover
        const imgIndex = currentIndex - 1;
        [1, 2, 3].forEach(offset => {
            const src = albumImages[imgIndex + offset];
            if (src) {
                const pre = new Image();
                pre.src = src;
            }
        });
    }
})();