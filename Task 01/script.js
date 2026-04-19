const imagesList = [
    { id: 1, img: "https://picsum.photos/id/104/900/700", thumb: "https://picsum.photos/id/104/300/300", tag: "nature", name: "misty mountains" },
    { id: 2, img: "https://picsum.photos/id/106/900/700", thumb: "https://picsum.photos/id/106/300/300", tag: "nature", name: "ocean waves" },
    { id: 3, img: "https://picsum.photos/id/15/900/700", thumb: "https://picsum.photos/id/15/300/300", tag: "nature", name: "forest path" },
    { id: 4, img: "https://picsum.photos/id/22/900/700", thumb: "https://picsum.photos/id/22/300/300", tag: "city", name: "tokyo nights" },
    { id: 5, img: "https://picsum.photos/id/96/900/700", thumb: "https://picsum.photos/id/96/300/300", tag: "city", name: "downtown" },
    { id: 6, img: "https://picsum.photos/id/20/900/700", thumb: "https://picsum.photos/id/20/300/300", tag: "art", name: "fluid art" },
    { id: 7, img: "https://picsum.photos/id/18/900/700", thumb: "https://picsum.photos/id/18/300/300", tag: "art", name: "color swirl" },
    { id: 8, img: "https://picsum.photos/id/100/900/700", thumb: "https://picsum.photos/id/100/300/300", tag: "wildlife", name: "brown bear" },
    { id: 9, img: "https://picsum.photos/id/26/900/700", thumb: "https://picsum.photos/id/26/300/300", tag: "wildlife", name: "curious cat" },
    { id: 10, img: "https://picsum.photos/id/49/900/700", thumb: "https://picsum.photos/id/49/300/300", tag: "nature", name: "alpine lake" },
    { id: 11, img: "https://picsum.photos/id/42/900/700", thumb: "https://picsum.photos/id/42/300/300", tag: "city", name: "glass tower" },
    { id: 12, img: "https://picsum.photos/id/29/900/700", thumb: "https://picsum.photos/id/29/300/300", tag: "art", name: "coffee art" },
    { id: 13, img: "https://picsum.photos/id/85/900/700", thumb: "https://picsum.photos/id/85/300/300", tag: "wildlife", name: "seagull" },
    { id: 14, img: "https://picsum.photos/id/58/900/700", thumb: "https://picsum.photos/id/58/300/300", tag: "nature", name: "autumn river" },
    { id: 15, img: "https://picsum.photos/id/0/900/700", thumb: "https://picsum.photos/id/0/300/300", tag: "city", name: "coffee shop" }
];

let activeFilter = "all";
let currentPageNum = 1;
let itemsEachPage = 6;
let lightboxImages = [];
let currentLightboxPos = 0;
let tipInterval;

function getFilteredPics() {
    if(activeFilter === "all") return imagesList;
    return imagesList.filter(pic => pic.tag === activeFilter);
}

function updateTip() {
    const tips = [
        "💡 pro tip: use arrow keys in lightbox",
        "🎯 click filters to explore categories",
        "✨ hover effect works on all images",
        "📱 responsive on mobile devices",
        "🖼️ click any image for fullscreen view",
        "⭐ try next/prev buttons for pagination"
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    const tipElement = document.getElementById("tipText");
    if(tipElement) {
        tipElement.style.opacity = "0";
        setTimeout(() => {
            tipElement.innerHTML = randomTip;
            tipElement.style.opacity = "1";
        }, 200);
    }
}

function renderGallery() {
    const filtered = getFilteredPics();
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsEachPage);
    
    if(currentPageNum > totalPages && totalPages > 0) currentPageNum = totalPages;
    if(currentPageNum < 1) currentPageNum = 1;
    
    const start = (currentPageNum - 1) * itemsEachPage;
    const end = start + itemsEachPage;
    const pageItems = filtered.slice(start, end);
    
    const pageSpan = document.getElementById("pageNum");
    if(pageSpan) pageSpan.innerText = `page ${currentPageNum} of ${totalPages || 1}`;
    
    const galleryDiv = document.getElementById("galleryGrid");
    if(!galleryDiv) return;
    
    if(pageItems.length === 0) {
        galleryDiv.innerHTML = `<div class="no-items">✨ no images found in this category ✨</div>`;
        return;
    }
    
    let html = "";
    for(let item of pageItems) {
        html += `
            <div class="gallery-card" data-id="${item.id}" data-full="${item.img}" data-title="${item.name}" data-cat="${item.tag}">
                <img src="${item.thumb}" alt="${item.name}" loading="lazy">
                <div class="card-category">${item.tag}</div>
            </div>
        `;
    }
    galleryDiv.innerHTML = html;
    
    document.querySelectorAll('.gallery-card').forEach(card => {
        card.addEventListener('click', function(e) {
            const fullImg = this.getAttribute('data-full');
            const title = this.getAttribute('data-title');
            openLightboxWithImage(fullImg, title);
        });
    });
}

function openLightboxWithImage(src, title) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImage");
    const caption = document.getElementById("lightboxCaption");
    
    if(lightboxImg && caption) {
        lightboxImg.src = src;
        caption.innerText = title || "gallery image";
        lightbox.classList.add("active");
        
        const currentFiltered = getFilteredPics();
        lightboxImages = currentFiltered.map(p => ({ url: p.img, name: p.name, id: p.id }));
        const foundIdx = lightboxImages.findIndex(img => img.url === src);
        currentLightboxPos = foundIdx !== -1 ? foundIdx : 0;
    }
}

function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    if(lightbox) lightbox.classList.remove("active");
}

function nextLightboxImg() {
    if(lightboxImages.length === 0) return;
    currentLightboxPos = (currentLightboxPos + 1) % lightboxImages.length;
    const imgObj = lightboxImages[currentLightboxPos];
    const lightboxImg = document.getElementById("lightboxImage");
    const caption = document.getElementById("lightboxCaption");
    if(lightboxImg && imgObj) {
        lightboxImg.src = imgObj.url;
        caption.innerText = imgObj.name;
    }
}

function prevLightboxImg() {
    if(lightboxImages.length === 0) return;
    currentLightboxPos = (currentLightboxPos - 1 + lightboxImages.length) % lightboxImages.length;
    const imgObj = lightboxImages[currentLightboxPos];
    const lightboxImg = document.getElementById("lightboxImage");
    const caption = document.getElementById("lightboxCaption");
    if(lightboxImg && imgObj) {
        lightboxImg.src = imgObj.url;
        caption.innerText = imgObj.name;
    }
}

function changePage(direction) {
    const filtered = getFilteredPics();
    const totalPages = Math.ceil(filtered.length / itemsEachPage);
    if(direction === 'prev' && currentPageNum > 1) currentPageNum--;
    else if(direction === 'next' && currentPageNum < totalPages) currentPageNum++;
    else if(direction === 'prev' && currentPageNum === 1 && totalPages > 0) currentPageNum = totalPages;
    else if(direction === 'next' && currentPageNum === totalPages && totalPages > 0) currentPageNum = 1;
    renderGallery();
}

document.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeFilter = this.getAttribute('data-filter');
        currentPageNum = 1;
        renderGallery();
        updateTip();
    });
});

document.getElementById("prevBtn")?.addEventListener('click', () => changePage('prev'));
document.getElementById("nextBtn")?.addEventListener('click', () => changePage('next'));
document.getElementById("closeLightbox")?.addEventListener('click', closeLightbox);
document.getElementById("lightboxPrev")?.addEventListener('click', prevLightboxImg);
document.getElementById("lightboxNext")?.addEventListener('click', nextLightboxImg);

document.getElementById("lightbox")?.addEventListener('click', function(e) {
    if(e.target === this) closeLightbox();
});

document.addEventListener('keydown', function(e) {
    const lb = document.getElementById("lightbox");
    if(!lb || !lb.classList.contains('active')) return;
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowLeft') prevLightboxImg();
    if(e.key === 'ArrowRight') nextLightboxImg();
});

renderGallery();
setInterval(updateTip, 10000);