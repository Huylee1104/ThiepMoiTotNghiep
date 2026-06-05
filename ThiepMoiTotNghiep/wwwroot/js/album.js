(function () {
    "use strict";

    function cdnOpt(url) {
        return url.replace("/image/upload/", "/image/upload/f_auto,q_78,w_1200/");
    }

    const albumImages = [
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889015/1_cpy5re.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889015/2_sjiitr.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889014/3_zhio9v.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889015/4_c5rav6.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889015/5_gyw2t8.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889295/6_onp39s.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889295/7_lzltvi.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889296/8_pzd3w2.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1780662823/20260605_175322_w28h2p.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889658/9_ia4umt.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889296/10_nse6ax.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889297/11_vlxmla.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1780662923/IMG_1780202538165_1780658880466_gfbztb.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889297/12_fo2etv.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889298/13_rdniqb.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889298/14_fgnenk.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889299/15_usomsw.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889299/16_zuhajh.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889299/17_iak5fb.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889300/18_fxbo1g.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889300/19_mmam0i.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889301/20_djtyrl.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889302/21_fu10dd.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889302/22_aw13cl.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889302/23_k4huz9.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889303/24_kqbr4c.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889303/25_dwpxbn.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889304/26_wfldhh.jpg",
        "https://res.cloudinary.com/dqbnrxg4q/image/upload/v1779889304/27_dodpkd.jpg",

    ].map(cdnOpt);

    const modal = document.getElementById("albumModal");
    const btnOpen = document.getElementById("btnAlbum");
    const btnClose = document.getElementById("btnCloseAlbum");
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");
    const container = document.getElementById("flipbookContainer");
    const loading = document.getElementById("albumLoading");
    const pageInfo = document.getElementById("albumPageInfo");
    const footer = document.getElementById("albumFooter");

    function getFlipbookSize() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const isMobile = vw <= 640;
        const pageH = Math.min(Math.max(Math.floor(vh * 0.72), 280), 640);
        const pageW = Math.floor(pageH * 0.72);
        return { pageW, pageH, isMobile };
    }

    // Load ảnh thật cho 1 trang (dùng data-src để lazy)
    function loadPageImages(page) {
        if (!page) return;
        page.querySelectorAll("img[data-src]").forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
        });
    }

    // Unload ảnh trang xa để giải phóng memory
    function unloadPageImages(page) {
        if (!page) return;
        page.querySelectorAll("img[src]:not([src=''])").forEach(img => {
            // Không unload cover (không có data-img-index)
            if (img.dataset.lazy === "true") {
                img.dataset.src = img.src;
                img.src = "";
            }
        });
    }

    let allPages = [];

    function activatePages(currentIndex) {
        allPages.forEach((page, i) => {
            if (Math.abs(i - currentIndex) <= 1) {
                loadPageImages(page);
            } else if (Math.abs(i - currentIndex) > 2) {
                unloadPageImages(page);
            }
        });
    }

    function buildPages() {
        container.querySelectorAll(".album-page").forEach(p => p.remove());
        allPages = [];

        const { pageW, pageH, isMobile } = getFlipbookSize();

        // Bìa trước
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
            for (let i = 0; i < 5; i++) row.appendChild(document.createElement("span"));
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

        coverFront.append(ornament, makeDivider(), covTitle, covSub, makeDots(), covYear, makeDivider(), ornament2);
        container.appendChild(coverFront);
        allPages.push(coverFront);

        // Các trang ảnh — lazy load qua data-src
        albumImages.forEach((src, idx) => {
            const page = document.createElement("div");
            page.className = "album-page";
            page.style.cssText = `width:${pageW}px;height:${pageH}px;`;

            // Chỉ render bgImg trên desktop
            if (!isMobile) {
                const bgImg = document.createElement("img");
                bgImg.dataset.src = src;
                bgImg.dataset.lazy = "true";
                bgImg.className = "album-page-bg";
                bgImg.draggable = false;
                bgImg.setAttribute("aria-hidden", "true");
                page.appendChild(bgImg);
            }

            const img = document.createElement("img");
            img.dataset.src = src;
            img.dataset.lazy = "true";
            img.alt = "Ảnh album tốt nghiệp";
            img.draggable = false;
            img.decoding = "async";
            // Trang đầu tiên load ngay, còn lại lazy
            if (idx === 0) {
                img.src = src;
                img.removeAttribute("data-src");
            }

            page.appendChild(img);
            container.appendChild(page);
            allPages.push(page);
        });

        // Bìa sau
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
        allPages.push(coverBack);
    }

    let pageFlip = null;

    function buildDots(totalPages) {
        footer.innerHTML = "";
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement("button");
            dot.className = "dot" + (i === 0 ? " active" : "");
            dot.setAttribute("aria-label", `Đến trang ${i + 1}`);
            dot.addEventListener("click", () => { if (pageFlip) pageFlip.flip(i); });
            footer.appendChild(dot);
        }
    }

    function updateDots(pageIndex) {
        footer.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("active", i === pageIndex));
    }

    function updatePageInfo(current, total) {
        pageInfo.textContent = `Trang ${current + 1} / ${total}`;
    }

    let isInitialized = false;

    function initFlipbook() {
        const { pageW, pageH, isMobile } = getFlipbookSize();
        const displayW = isMobile ? pageW : pageW * 2;
        container.style.width = displayW + "px";
        container.style.height = pageH + "px";

        buildPages();

        const totalPages = allPages.length;
        buildDots(totalPages);

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
            singlePage: isMobile,
            startPage: 0,
            drawShadow: true,
            maxShadowOpacity: 0.6,
            autoSize: false,
            mobileScrollSupport: false,
            swipeDistance: isMobile ? 30 : 50,
            clickEventForward: true,
            useMouseEvents: true,
        });

        pageFlip.loadFromHTML(container.querySelectorAll(".album-page"));

        pageFlip.on("flip", (e) => {
            updateDots(e.data);
            updatePageInfo(e.data, totalPages);
            activatePages(e.data);
            // Preload chỉ 1 ảnh kế tiếp
            const nextSrc = albumImages[e.data];
            if (nextSrc) new Image().src = nextSrc;
        });

        pageFlip.on("init", () => {
            setTimeout(() => {
                loading.classList.add("hidden");
                updatePageInfo(0, totalPages);
                activatePages(0);
            }, 300);
        });

        isInitialized = true;
    }

    function openModal() {
        modal.classList.add("is-open");
        document.body.style.overflow = "hidden";

        if (!isInitialized) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(initFlipbook, 80);
                });
            });
        } else {
            loading.classList.add("hidden");
            if (pageFlip) pageFlip.turnToPage(0);
        }
    }

    function closeModal() {
        modal.classList.remove("is-open");
        document.body.style.overflow = "";
    }

    btnOpen.addEventListener("click", openModal);
    btnClose.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
        if (!pageFlip) return;
        if (e.key === "ArrowRight") pageFlip.flipNext();
        if (e.key === "ArrowLeft") pageFlip.flipPrev();
    });

    btnPrev.addEventListener("click", () => { if (pageFlip) pageFlip.flipPrev(); });
    btnNext.addEventListener("click", () => { if (pageFlip) pageFlip.flipNext(); });

    let resizeTimer;
    window.addEventListener("resize", () => {
        if (!modal.classList.contains("is-open")) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (pageFlip) {
                pageFlip.destroy();
                pageFlip = null;
                isInitialized = false;
                loading.classList.remove("hidden");
            }
            initFlipbook();
        }, 300);
    });
})();