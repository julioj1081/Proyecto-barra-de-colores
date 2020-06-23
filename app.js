//variables
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate")
const sliders = document.querySelectorAll("input[type='range']");
const currentHexes = document.querySelectorAll(".color h2");
/*btn de ajustes */
const btnAdjust = document.querySelectorAll(".adjust");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
/*botones constraste */
const lockbutton = document.querySelectorAll(".lock");

/*popup */
const popup = document.querySelector(".copy-container");
let initialColors;
/*BOTON PARA GENERAR OTROS COLORES */
generateBtn.addEventListener("click", randomColors);

/*THIS IS FOR THE LOCAL STORAGE */
let savedPalettes = [];

//Add our events listeners
// Los 3 sliders los convertimos a input y cambiamos los valores 
sliders.forEach(sliders => {
    sliders.addEventListener("input", hslControls);
});
colorDivs.forEach((div, index) => {
    div.addEventListener("change", function() {
        updateTextHexa(index);
    });
});
/*function de copy color del titulo */
currentHexes.forEach(hex => {
    //console.log(hex);
    hex.addEventListener("click", function() {
        copyToClipboard(hex);
    });
});
/*cuando se termine la transicion se quitara la clase active */
popup.addEventListener("transitionend", () => {
    const popupBox = popup.children[0];
    popup.classList.remove("active");
    popupBox.classList.remove("active");
});

/*ABRE LOS CONTROLES */
btnAdjust.forEach((button, index) => {
    button.addEventListener("click", function() {
        openAdjustementPanel(index);
    });
});
closeAdjustments.forEach((button, index) => {
    button.addEventListener("click", function() {
        closeAdjustementPanelX(index);
    })
});
/* ********************** BOTTON BLOQUEO DE COLOR */
lockbutton.forEach((button, index) => {
    button.addEventListener("click", function() {
        lockColor(index);
    })
});

function lockColor(index) {
    colorDivs[index].classList.toggle("locked");
    lockbutton[index].children[0].classList.toggle("fa-lock-open");
    lockbutton[index].children[0].classList.toggle("fa-lock");
}
/**************************** */
//Functions en js nativo genera colores
function generateHex() {
    const letters = "0123456789ABCDEF";
    let hash = "#";
    for (let i = 0; i < 6; i++) {
        hash += letters[Math.floor(Math.random() * 16)];
    }
    return hash;
}

//let randomHex = generateHex();
//console.log(randomHex);

function randomColors() {
    /*Creamos un arreglo para poder guardar los colores luego */
    initialColors = [];
    colorDivs.forEach((div, index) => {
        //console.log(div)
        const hexText = div.children[0];
        const randomColor = generateHex();
        ////////////////////////////
        /*BOTON DE BLOCKEO DE COLORES*/
        if (div.classList.contains('locked')) {
            initialColors.push(hexText.innerText);
            return;
        } else {
            // Add it to the array añadimos a un arreglo
            //console.log(hexText.innerText, randomColor);
            //console.log(chroma(randomColor).hex());
            initialColors.push(chroma(randomColor).hex());
        }

        //add color in the background
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        //check for contrast
        checkTextContrast(randomColor, hexText);
        //initial colorize sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");
        //MUESTRA LOS RANGES INPUTS
        //console.log(sliders);
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];
        colorizeSliders(color, hue, brightness, saturation);
    });
    /*RESETEO DE INPUTS AL REFRESCAR LA WEB */
    resertInputs();
    /**CHECA LOS BOTONES EL CONSTRASTE AL MOMENTO DE HACER RESERT */
    btnAdjust.forEach((button, index) => {
        checkTextContrast(initialColors[index], button);
        checkTextContrast(initialColors[index], lockbutton[index]);
    });
}

function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    if (luminance > 0.5) {
        text.style.color = "black";
    } else {
        text.style.color = "white";
    }
}

function colorizeSliders(color, hue, brightness, saturation) {
    //Scale saturation
    const noSaturation = color.set('hsl.s', 0);
    const fullSaturation = color.set('hsl.s', 1);
    const scaleSaturation = chroma.scale([noSaturation, color, fullSaturation]);
    //Scale Brightness
    const midBrightness = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(['black', midBrightness, 'white'])
        //update input color saturation
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSaturation(0)}, ${scaleSaturation(1)})`;
    //update input color brightness
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`;

    //Update input color hue
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75), rgb(75,204,75), rgb(75,204,204), rgb(75,75,204), rgb(204,75,204), rgb(204,75,75))`;
}
/*cambiamos los valores de los inputs ranges */
function hslControls(e) {
    //console.log(e);
    const index = e.target.getAttribute("data-bright") || e.target.getAttribute("data-sat") || e.target.getAttribute("data-hue");
    // esto nos permite elegir el input con sus atributos
    // si le agregamos parentElement obtendremos subimos al div y podremos obtener 
    // los 3 sliders
    //console.log(e.target.parentElement);
    let sliders = e.target.parentElement.querySelectorAll("input[type='range']");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    //seleccionamos el color de acuerdo al nuevo elemento
    //const bgColor = colorDivs[index].querySelector("h2").innerText;
    const bgColor = initialColors[index];
    //console.log(bgColor);
    let color = chroma(bgColor)
        .set('hsl.s', saturation.value)
        .set('hsl.l', brightness.value)
        .set('hsl.h', hue.value);
    /*Le agregamos el color a los divs */
    colorDivs[index].style.backgroundColor = color;
    /*COLOR A LOS INPUT Y SLIDERS */
    colorizeSliders(color, hue, brightness, saturation);
}

/*MODIFICACION DE TEXTO*/
function updateTextHexa(index) {
    /*seleccionamos el div y sacamos el atributo rgb de cada range*/
    const activeDivs = colorDivs[index];
    const colorUpdate = chroma(activeDivs.style.backgroundColor);
    const textHex = activeDivs.querySelector("h2");
    const icons = activeDivs.querySelectorAll(".controls button");
    textHex.innerText = colorUpdate.hex();
    /* function para sacar el contraste de las letras por ejemplo
    si elegimos un color blanco el texto se vuelva negro y vicebersa*/
    checkTextContrast(colorUpdate, textHex);
    for (icon of icons) {
        checkTextContrast(colorUpdate, icon);
    }

}

function resertInputs() {
    const sliders = document.querySelectorAll(".sliders input");
    /*TOMAREMOS EL VALOR DEL BACKGROUND CUANDO CARGE LA PAGINA Y SE LO AGREGAREMOS AL INPUT HUE*/
    sliders.forEach(slider => {
        if (slider.name === "hue") {
            const hueColor = initialColors[slider.getAttribute('data-hue')];
            /*lo extraemos*/
            const hueValue = chroma(hueColor).hsl()[0];
            //console.log(hueValue);
            slider.value = Math.floor(hueValue);
        }
        if (slider.name === "brightness") {
            const brightColor = initialColors[slider.getAttribute('data-bright')];
            /*lo extraemos*/
            const brightValue = chroma(brightColor).hsl()[2];
            //console.log(Math.floor(brightValue * 100) / 100);
            slider.value = Math.floor(brightValue * 100) / 100;
        }
        if (slider.name === "saturation") {
            const saturationColor = initialColors[slider.getAttribute('data-sat')];
            /*lo extraemos*/
            const saturationValue = chroma(saturationColor).hsl()[1];
            //console.log(Math.floor(saturationValue * 100) / 100);
            slider.value = Math.floor(saturationValue * 100) / 100;
        }
    });

}
// *copy to clipboard
function copyToClipboard(hex) {
    /*CREAMOS UN ELEMENTO PARA CREAR UN TEXTO y un comando copy */
    const el = document.createElement("textarea");
    el.value = hex.innerText;
    //console.log(el.value);
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    /* sacamos la animacion popup*/
    const popupBox = popup.children[0];
    //console.log(popupBox)
    popup.classList.add("active");
    popupBox.classList.add("active");
}

//?ABRE LOS CONTROLES DE CADA SLIDER 
function openAdjustementPanel(index) {
    sliderContainers[index].classList.toggle("active");
}

function closeAdjustementPanelX(index) {
    sliderContainers[index].classList.remove("active");
}
/*GUARDADO DE COLORES EN EL LOCAL*/
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-name");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
//?LIBRARY CONTAINER */
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
/*LIBRARY BTNS */
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

function openPalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add("active");
    popup.classList.add("active");
}

function closePalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove("active");
    popup.classList.add("remove");
}
/**creamos elementos para poder visualizarlos en la libreria */
function savePalette(e) {
    saveContainer.classList.remove("active");
    popup.classList.remove("active");
    const name = saveInput.value;
    const colors = [];
    currentHexes.forEach(hex => {
        colors.push(hex.innerText);
    });
    //Generate objetc
    let paletterNr;
    const palettesObjets = JSON.parse(localStorage.getItem("palettes"));
    /**CONSTRUCCION DEL IF PARA QUE LOS BOTONES SELECT NO SE REINICIEN EN 0 
     * POR EJEMPLO AÑADIMOS DOS COLORES NEW0 Y NEW1 SI DAMOS REFRESCAR CORRIGE EL ERROR NEW0, NEW1, NEW0
     * QUE DANDO DE LA SIGUIENTE MANERA NEW0, NEW1, NEW2
     */
    if (palettesObjets) {
        paletterNr = palettesObjets.length;
    } else {
        paletterNr = savedPalettes.length;
    }

    const paletteObj = { name, colors, nr: paletterNr };
    savedPalettes.push(paletteObj);
    //console.log(savedPalettes);
    savetoLocal(paletteObj);
    saveInput.value = "";
    //GENERATE THE PALETTE FOR THE LIBRARY
    const palette = document.createElement("div");
    palette.classList.add("custom-palette");
    const title = document.createElement("h4");
    title.innerText = paletteObj.name;
    const preview = document.createElement("div");
    preview.classList.add("small-preview");
    paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
    });
    /*creacion del boton palette */
    const paletteBtn = document.createElement("button");
    paletteBtn.classList.add("pick-palette-btn");
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText = "Select";

    /**ATTACH EVENT TO THE BTN */
    paletteBtn.addEventListener("click", e => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        /** paletteIndex regresa el numero nr de colores de cada arreglo */
        initialColors = [];
        savedPalettes[paletteIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color, text);
            updateTextHexa(index);
        });
        /**para que se modifique los inputs ranges */
        resertInputs();
    });

    /**APPEND TO LIBRARY */
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);

}

function savetoLocal(paletteObj) {
    let localPalettes;
    if (localStorage.getItem('palettes') === null) {
        localPalettes = [];
    } else {
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
    }
    localPalettes.push(paletteObj);
    localStorage.setItem('palettes', JSON.stringify(localPalettes));
}

function getLocal() {
    if (localStorage.getItem('palettes') == null) {
        localPalettes = [];
    } else {
        const palettesObjets = JSON.parse(localStorage.getItem('palettes'));
        /**PARTE DE LA CORRECCION DEL ERROR NEW0, NEW1, NEW0 
         * EN LOS BOTONES AL MOMENTO DE SELECCIONAR UN COLOR
         * ESTA FUNCION ES UN SUCCESSION DE OTRO ARREGLO COMO CONTINUIDAD EN UN ARRAY
         */
        savedPalettes = [...palettesObjets];
        palettesObjets.forEach(paletteObj => {
            //GENERATE THE PALETTE FOR THE LIBRARY
            const palette = document.createElement("div");
            palette.classList.add("custom-palette");
            const title = document.createElement("h4");
            title.innerText = paletteObj.name;
            const preview = document.createElement("div");
            preview.classList.add("small-preview");
            paletteObj.colors.forEach(smallColor => {
                const smallDiv = document.createElement("div");
                smallDiv.style.backgroundColor = smallColor;
                preview.appendChild(smallDiv);
            });
            /*creacion del boton palette */
            const paletteBtn = document.createElement("button");
            paletteBtn.classList.add("pick-palette-btn");
            paletteBtn.classList.add(paletteObj.nr);
            paletteBtn.innerText = "Select";

            /**ATTACH EVENT TO THE BTN */
            paletteBtn.addEventListener("click", e => {
                closeLibrary();
                const paletteIndex = e.target.classList[1];
                /** paletteIndex regresa el numero nr de colores de cada arreglo */
                initialColors = [];
                palettesObjets[paletteIndex].colors.forEach((color, index) => {
                    initialColors.push(color);
                    colorDivs[index].style.backgroundColor = color;
                    const text = colorDivs[index].children[0];
                    checkTextContrast(color, text);
                    updateTextHexa(index);
                });
                /**para que se modifique los inputs ranges */
                resertInputs();
            });

            /**APPEND TO LIBRARY */
            palette.appendChild(title);
            palette.appendChild(preview);
            palette.appendChild(paletteBtn);
            libraryContainer.children[0].appendChild(palette);

        });
    }
}

function openLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add("active");
    popup.classList.add("active");
}

function closeLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove("active");
    popup.classList.remove("active");
}

getLocal();
randomColors();

/**PARA LIMPIAR TODO EL LOCALSTORAGE USAMOS 
 * localStorage.clear(); */