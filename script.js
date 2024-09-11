const imageUpload = document.getElementById('imageUpload');
const textInput = document.getElementById('textInput');
const addTextBtn = document.getElementById('addTextBtn');
const overlayImageUpload = document.getElementById('overlayImageUpload');
const addOverlayBtn = document.getElementById('addOverlayBtn');
const applyToAll = document.getElementById('applyToAll');
const addOverlay = document.getElementById('addOverlay');
const imageContainer = document.getElementById('imageContainer');
const fontSize = document.getElementById('fontSize');
const textColor = document.getElementById('textColor');
const overlayColor = document.getElementById('overlayColor');
const overlayOpacity = document.getElementById('overlayOpacity');
const opacityValue = document.getElementById('opacityValue');
const liveChanges = document.getElementById('liveChanges');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const overlayWidth = document.getElementById('overlayWidth');
const downloadFormat = document.getElementById('downloadFormat');



let images = [];

imageUpload.addEventListener('change', (e) => {
    const files = e.target.files;
    images = [];
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                images.push(img);
                renderImages();
            };
        };
        reader.readAsDataURL(file);
    }
});

function renderImages() {
    imageContainer.innerHTML = '';
    images.forEach((img, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'relative bg-white p-4  m-4 rounded-lg shadow-md';
        wrapper.style.width = `${img.width}px`;
        wrapper.style.height = `${img.height + 40}px`;
        wrapper.innerHTML = `
            <img src="${img.src}" alt="Uploaded image ${index + 1}" class="w-full h-[calc(100%-40px)] 
            
            object-contain mb-2">
            <div class="overlay absolute inset-0 bg-black opacity-50 hidden"></div>
            <button class="download-btn absolute btn-sm
            bottom-2 left-2 right-2 bg-green-500 text-white rounded-lg py-1 
            px-2 text-sm hover:bg-green-600 transition duration-300">Download</button>
        `;
        const downloadBtn = wrapper.querySelector('.download-btn');
        downloadBtn.addEventListener('click', async () => {
            const format = downloadFormat.value;
            const dataUrl = await downloadImage(index, format);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `edited_image_${index + 1}.${format}`;
            link.click();
        });
        imageContainer.appendChild(wrapper);
    });
    updateOverlay();
}

addTextBtn.addEventListener('click', () => {
    const text = textInput.value;
    if (text) {
        addElementToImages('text', text);
    }
});

addOverlayBtn.addEventListener('click', () => {
    const file = overlayImageUpload.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            addElementToImages('image', event.target.result);
        };
        reader.readAsDataURL(file);
    }
});

function addElementToImages(type, content) {
    const wrappers = imageContainer.querySelectorAll('.relative');
    wrappers.forEach((wrapper, index) => {
        if (applyToAll.checked || index === 0) {
            const element = document.createElement(type === 'text' ? 'div' : 'img');
            element.className = 'draggable absolute';
            if (type === 'text') {
                element.textContent = content;
                element.style.color = textColor.value;
                element.style.fontSize = `${fontSize.value}px`;
                element.style.textShadow = '1px 1px 2px black';
            } else {
                element.src = content;
                element.style.maxWidth = '50%';
                element.style.maxHeight = '50%';
                element.style.resize = 'both';
                element.style.overflow = 'auto';
            }
            element.style.left = '10px';
            element.style.top = '10px';
            makeDraggable(element);
            wrapper.appendChild(element);
        }
    });
    updateOverlay();
}

function updateOverlay() {
    const wrappers = imageContainer.querySelectorAll('.relative');
    wrappers.forEach((wrapper) => {
        const overlay = wrapper.querySelector('.overlay');
        if (addOverlay.checked) {
            overlay.style.backgroundColor = overlayColor.value;
            overlay.style.opacity = overlayOpacity.value;
            overlay.style.display = 'block';
        } else {
            overlay.style.display = 'none';
        }
    });
}

addOverlay.addEventListener('change', updateOverlay);
overlayColor.addEventListener('input', updateOverlay);
overlayOpacity.addEventListener('input', () => {
    opacityValue.textContent = overlayOpacity.value;
    updateOverlay();
});

function makeDraggable(element) {
    let isDragging = false;
    let startX, startY, origX, origY;

    element.addEventListener('mousedown', startDrag);
    element.addEventListener('touchstart', startDrag);

    function startDrag(e) {
        isDragging = true;
        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }
        origX = element.offsetLeft;
        origY = element.offsetTop;

        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            let clientX, clientY;
            if (e.type === 'touchmove') {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            const dx = clientX - startX;
            const dy = clientY - startY;
            element.style.left = `${origX + dx}px`;
            element.style.top = `${origY + dy}px`;

            if (liveChanges.checked) {
                applyChangesToAllImages();
            }
        }
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
    }
}

function applyChangesToAllImages() {
    const firstWrapper = imageContainer.querySelector('.relative');
    const otherWrappers = imageContainer.querySelectorAll('.relative:not(:first-child)');
    const firstOverlayElements = firstWrapper.querySelectorAll('.draggable');

    otherWrappers.forEach(wrapper => {
        // Remove existing overlay elements
        wrapper.querySelectorAll('.draggable').forEach(el => el.remove());

        // Clone and append new overlay elements
        firstOverlayElements.forEach(sourceElement => {
            const clonedElement = sourceElement.cloneNode(true);
            wrapper.appendChild(clonedElement);
            makeDraggable(clonedElement);
            makeResizable(clonedElement);
        });
    });

    updateOverlay();
}

liveChanges.addEventListener('change', () => {
    if (liveChanges.checked) {
        applyChangesToAllImages();
    }
});

function downloadImage(index, format = 'png') {
    const wrapper = imageContainer.querySelectorAll('.relative')[index];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = wrapper.querySelector('img');

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.drawImage(img, 0, 0);

    if (addOverlay.checked) {
        ctx.fillStyle = overlayColor.value + Math.round(overlayOpacity.value * 255).toString(16).padStart(2, '0');
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    wrapper.querySelectorAll('.draggable').forEach((element) => {
        const rect = element.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        const x = (rect.left - wrapperRect.left) * (canvas.width / wrapperRect.width);
        const y = (rect.top - wrapperRect.top) * (canvas.height / wrapperRect.height);
        if (element.tagName === 'DIV') {
            ctx.font = `${element.style.fontSize} Arial`;
            ctx.fillStyle = element.style.color;
            ctx.fillText(element.textContent, x, y + parseInt(element.style.fontSize));
        } else {
            const width = element.width * (canvas.width / wrapperRect.width);
            const height = element.height * (canvas.height / wrapperRect.height);
            ctx.drawImage(element, x, y, width, height);
        }
    });

    return new Promise((resolve) => {
        if (format === 'png') {
            resolve(canvas.toDataURL('image/png'));
        } else if (format === 'jpeg') {
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        } else if (format === 'webp') {
            canvas.toBlob((blob) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            }, 'image/webp');
        }
    });
}

downloadAllBtn.addEventListener('click', async () => {
    const zip = new JSZip();
    const wrappers = imageContainer.querySelectorAll('.relative');
    const format = downloadFormat.value;

    for (let index = 0; index < wrappers.length; index++) {
        const dataUrl = await downloadImage(index, format);
        const base64Data = dataUrl.split(',')[1];
        zip.file(`edited_image_${index + 1}.${format}`, base64Data, { base64: true });
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `edited_images.zip`);
});


// Add event listeners for live changes
textInput.addEventListener('input', applyLiveChanges);

fontSize.addEventListener('input', applyLiveChanges);
textColor.addEventListener('input', applyLiveChanges);
overlayColor.addEventListener('input', applyLiveChanges);
overlayOpacity.addEventListener('input', applyLiveChanges);

function applyLiveChanges() {
    if (liveChanges.checked) {
        applyChangesToAllImages();
    }
}
overlayWidth.addEventListener('input', applyLiveChanges);
function updateElementsInWrapper(wrapper) {
    wrapper.querySelectorAll('.draggable').forEach(element => {
        if (element.tagName === 'DIV') {
            element.style.fontSize = `${fontSize.value}px`;
            element.style.color = textColor.value;
        }
        element.style.width = `${overlayWidth.value}px`;
    });
    updateOverlay();
}

function updateElementsInWrapper(wrapper) {
    wrapper.querySelectorAll('.draggable').forEach(element => {
        if (element.tagName === 'DIV') {
            element.style.fontSize = `${fontSize.value}px`;
            element.style.color = textColor.value;
        }
        element.style.width = `${overlayWidth.value}px`;
    });
    updateOverlay();
}

// Update the addElementToImages function to handle resizing
function addElementToImages(type, content) {
    const wrappers = imageContainer.querySelectorAll('.relative');
    wrappers.forEach((wrapper, index) => {
        if (applyToAll.checked || index === 0) {
            const element = document.createElement(type === 'text' ? 'div' : 'img');
            element.className = 'draggable absolute';
            if (type === 'text') {
                element.textContent = content;
                element.style.color = textColor.value;
                element.style.fontSize = `${fontSize.value}px`;
                element.style.textShadow = '1px 1px 2px black';
            } else {
                element.src = content;
                element.style.maxWidth = '100%';
                element.style.maxHeight = '100%';
            }
            element.style.left = '10px';
            element.style.top = '10px';
            element.style.width = `${overlayWidth.value}px`;
            makeDraggable(element);
            makeResizable(element);
            wrapper.appendChild(element);
        }
    });
    updateOverlay();
}


// Modify the makeResizable function
function makeResizable(element) {
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    resizer.style.width = '10px';
    resizer.style.height = '10px';
    resizer.style.background = 'white';
    resizer.style.position = 'absolute';
    resizer.style.right = '0';
    resizer.style.bottom = '0';
    resizer.style.cursor = 'se-resize';
    element.appendChild(resizer);

    resizer.addEventListener('mousedown', initResize, false);

    function initResize(e) {
        window.addEventListener('mousemove', resize, false);
        window.addEventListener('mouseup', stopResize, false);
    }

    function resize(e) {
        const newWidth = e.clientX - element.offsetLeft;
        const newHeight = e.clientY - element.offsetTop;
        element.style.width = `${newWidth}px`;
        if (element.tagName === 'IMG') {
            element.style.height = `${newHeight}px`;
        }
        if (liveChanges.checked) {
            updateOverlaySizes(element);
        }
    }

    function stopResize(e) {
        window.removeEventListener('mousemove', resize, false);
        window.removeEventListener('mouseup', stopResize, false);
    }
}

function updateOverlaySizes(sourceElement) {
    const allWrappers = imageContainer.querySelectorAll('.relative');
    const sourceIndex = Array.from(sourceElement.parentNode.querySelectorAll('.draggable')).indexOf(sourceElement);

    allWrappers.forEach(wrapper => {
        const targetElement = wrapper.querySelectorAll('.draggable')[sourceIndex];
        if (targetElement && targetElement !== sourceElement) {
            targetElement.style.width = sourceElement.style.width;
            targetElement.style.height = sourceElement.style.height;
        }
    });
}


overlayWidth.addEventListener('input', () => {
    const draggables = document.querySelectorAll('.draggable');
    draggables.forEach(element => {
        element.style.width = `${overlayWidth.value}px`;
    });
    if (liveChanges.checked) {
        applyChangesToAllImages();
    }
});

// Update the applyChangesToAllImages function to handle resizing
function applyChangesToAllImages() {
    const firstWrapper = imageContainer.querySelector('.relative');
    const otherWrappers = imageContainer.querySelectorAll('.relative:not(:first-child)');
    const firstOverlayElements = firstWrapper.querySelectorAll('.draggable');

    otherWrappers.forEach(wrapper => {
        // Remove existing overlay elements
        wrapper.querySelectorAll('.draggable').forEach(el => el.remove());

        // Clone and append new overlay elements
        firstOverlayElements.forEach(sourceElement => {
            const clonedElement = sourceElement.cloneNode(true);
            wrapper.appendChild(clonedElement);
            makeDraggable(clonedElement);
            makeResizable(clonedElement);
        });
    });

    updateOverlay();
}




// Call this function to initialize the editor
function initEditor() {
    renderImages();
    updateOverlay();
}

// Call initEditor when the page loads
window.addEventListener('load', initEditor);