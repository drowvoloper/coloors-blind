const hexCodes = document.querySelectorAll('.color__code');
const hexOri = document.querySelectorAll('.color--original');
const hexPro = document.querySelectorAll('.color--protanopia');
const hexDeu = document.querySelectorAll('.color--deuteranopia');
const hexTri = document.querySelectorAll('.color--tritanopia');
const generate = document.querySelector('.generate');
const save = document.querySelector('.save');
const savePanel = document.querySelector('.panel--save');
const saveBtn = document.querySelector('.save__btn');
const saveInput = savePanel.children[0].children[3];
const closeSave = savePanel.children[0].children[0];	
const library = document.querySelector('.library');
const libraryPanel = document.querySelector('.panel--library');
const closeLibrary = libraryPanel.children[0].children[0];
const palettesList = document.querySelector('.palettes-list');
const lockButtons = document.querySelectorAll('.color__lock');
const saveAlert = document.querySelector('.alert');
const palettes = palettesList.children;
const deletePalettes = document.getElementsByClassName('palette__delete');
const adjustmentPanels = document.querySelectorAll('.panel--adjustment');
const adjustmentButtons = document.querySelectorAll('.color__adjustment');
const closeAdjustment = document.querySelectorAll('.panel__modal--adjustment .panel__close');
const sliders = document.querySelectorAll('.sliders');
const originalExample = document.querySelectorAll('.original-example');
const changeButtons = document.querySelectorAll('.change-btn');
const infoPanel = document.querySelector('.panel--info');
const closeInfo = infoPanel.children[0].children[0];
const info = document.querySelector('.info');
const initialColors = ['first', 'second','third', 'fourth', 'fifth'];

/*
* https://github.com/skratchdot/color-blind
* "Simulate color blindness by converting RGB hex codes"
*/
const blinder = require('color-blind');


/* ########## Color & palette manipulation ########## */

const generateColor = (original = '') => {
  const color = {};
  color.original = original ? chroma(original).hex() : chroma.random().hex();
  color.protanopia = blinder.protanopia(color.original);
  color.deuteranopia = blinder.deuteranopia(color.original);
  color.tritanopia = blinder.tritanopia(color.original);
  return color;
} // #####

const checkContrast = (color, index) => {
  const luminance = chroma(color).luminance();
  luminance > 0.5
    ? hexCodes[index].style.color = "#292929"
    : hexCodes[index].style.color = "#f3f3f3";
} // #####

const lockColor = (index) => {
  if (hexCodes[index].classList.contains('locked')) {
    hexCodes[index].classList.remove('locked');
    lockButtons[index].innerHTML = '<i class="fas fa-lock-open"></i>';
  }
  else {
    hexCodes[index].classList.add('locked');
    lockButtons[index].innerHTML = '<i class="fas fa-lock"></i>';
  }
} // #####

const setColor = (color, index) => {
  hexCodes[index].innerText = color.original.slice(1);
  hexOri[index].parentNode.style.backgroundColor = color.original;
  hexPro[index].style.backgroundColor = color.protanopia;
  hexDeu[index].style.backgroundColor = color.deuteranopia;
  hexTri[index].style.backgroundColor = color.tritanopia;
  checkContrast(color.original, index); 	
} // #####

const displayColors = () => {
  hexCodes.forEach((code, index) => {
    if (code.classList.contains('locked')) return ;

    const color = generateColor();
		initialColors[index] = chroma(color.original).hex();
		setColor(color, index);
		colorizeSliders(index, chroma(color.original));
  });

	resetInputs();
} // ######

const displayPalette = (colors) => {

	for (let index = 0; index < 5; index++) {
		let color = generateColor(`${colors[index].style.backgroundColor}`);
		
		setColor(color, index);
	}

	showLibrary();
} // #####

const removePalette = (btn) => {
	let palette = btn.parentNode.parentNode;
	let paletteName = palette.children[0].innerText;
	palette.remove(); 
	deleteListeners();
	deletePalette(paletteName);

	if (palettes.length === 0) {
    palettesList.innerText = "There is no saved palette";
  }

} // #####

const deleteListeners = () => {
		if (deletePalettes.length > 0) {
			[...deletePalettes].forEach((btn) => {
				btn.addEventListener("click", (event) => {
					removePalette(btn);
					event.stopPropagation();
				})
			});
		}
} // ######

const showSavedPalettes = () => {
	let savedPalettes;
	savedPalettes = JSON.parse(localStorage.getItem("palettes"));
	
	if (savedPalettes.length === 0) {
		palettesList.innerText = "There is no saved palettes";
		return ;
	}

	palettesList.innerHTML = '';

	for (const palette of savedPalettes) {
		let name = Object.keys(palette)[0];
		let paragraph = document.createElement('p');
		paragraph.innerText = name;

		let paletteBlock = document.createElement('div');
		paletteBlock.classList.add("palette");
		paletteBlock.tabIndex = 0;

		let paletteColors = document.createElement('div');
		paletteColors.classList.add("palette__colors");

		for (const color of palette[`${name}`]) {
			let colorElement = document.createElement('div');
			colorElement.classList.add("palette__color");
			colorElement.style.background = color;
			
			paletteColors.appendChild(colorElement);
		}

		let paletteDelete = document.createElement('button');
		paletteDelete.innerHTML = "<i class=\"fas fa-trash-alt\"></i>";
		paletteDelete.classList.add("palette__delete");

		paletteColors.appendChild(paletteDelete);
		paletteBlock.appendChild(paragraph);
		paletteBlock.appendChild(paletteColors);
		palettesList.appendChild(paletteBlock);
	}
} // #####


const colorizeSliders = (index, color) => {
	const currentSliders = sliders[index].querySelectorAll("input");
	const hue = currentSliders[0];
	const brightness = currentSliders[1];
	const saturation = currentSliders[2];

	hue.style.backgroundImage = `linear-gradient(to right,rgb(204, 75, 75), rgb(204,204 ,75),rgb(75, 204, 75),rgb(75, 204, 204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75) )`;

	const midBright = color.set("hsl.l", 0.5);
	const scaleBright = chroma.scale(["black", midBright, "white"]);
	brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`;

	const noSat = color.set('hsl.s', 0);
	const fullSat = color.set('hsl.s', 1);
	const scaleSat = chroma.scale([noSat, color, fullSat]);
	saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
} // #####

const hslControls = (event) => {
	const index = event.target.getAttribute("data-bright") 
								|| event.target.getAttribute("data-sat")
								|| event.target.getAttribute("data-hue");

	let sliders = event.target.parentElement.querySelectorAll('input[type="range"]');
	
	const hue = sliders[0];
	const brightness = sliders[1];
	const saturation = sliders[2];

	const originalColor = initialColors[index];

	let color = chroma(originalColor)
	.set('hsl.s', saturation.value)
	.set('hsl.l', brightness.value)
	.set('hsl.h', hue.value);

	originalExample[index].style.backgroundColor = color;
} // #####

const resetInputs = () => {
	const inputs = document.querySelectorAll(".sliders input");
	inputs.forEach((input) => {
		if (input.name === 'hue') {
			const index = input.getAttribute('data-hue');
			const hueColor = initialColors[index];
			const hueValue = chroma(hueColor).hsl()[0];
			input.value = Math.floor(hueValue);
		}
		if (input.name === 'brightness') {
			const index = input.getAttribute('data-bright');
			const brightColor = initialColors[index];
			const brightValue = chroma(brightColor).hsl()[2];
			input.value = Math.floor(brightValue * 100) / 100;		
		}
		if (input.name === 'sat') {
			const index = input.getAttribute('data-sat');
			const satColor = initialColors[index];
			const satValue = chroma(satColor).hsl()[1];
			input.value = Math.floor(satValue * 100) / 100;
		}
	})
} // #####

const changeOriginal = (index) => {
	const newColor = originalExample[index].style.backgroundColor;
	const color = generateColor(newColor);
	
	initialColors[index] = chroma(color.original).hex();
	
	setColor(color, index);

	hideAdjustments(index);
	colorizeSliders(index, chroma(color.original));
	resetInputs(); 
	 
} // #####

/* ########## Local Storage ########## */

const savePalette = () => {
	if (saveInput.value === '') return ;
	const colors = [];
	let palette = {};
	let savedPalettes;
	
	hexCodes.forEach((code) => {
		colors.push(`#${code.innerText}`);
	});	

	palette[`${saveInput.value}`] = colors;

	if (localStorage.getItem("palettes") === null) {
		savedPalettes = [];
	} else {
		savedPalettes = JSON.parse(localStorage.getItem("palettes"));
	}
	
	let filtered = savedPalettes.filter(
	(savedPalette) => saveInput.value in savedPalette);
	
	if (filtered.length > 0) {
		saveAlert.style.display = "block";
		saveAlert.style.color = "red";
		saveAlert.innerText = "Oops! A palette with that name already exists";
		return ;	
	}
 
	savedPalettes.push(palette);
	localStorage.setItem("palettes", JSON.stringify(savedPalettes));
	saveAlert.style.display = "block";
	saveAlert.style.color = "green";
	saveAlert.innerText = "Your palette was saved successfully!";
	saveInput.value = '';
	saveInput.focus();	
} // #####


const deletePalette = (paletteName) => {
	savedPalettes = JSON.parse(localStorage.getItem("palettes"));
	let filtered = savedPalettes.filter(
		(savedPalette) => !(paletteName in savedPalette));

  localStorage.setItem("palettes", JSON.stringify(filtered));	
} // #####

/* ########## Navigation ########## */ 

const showSave = () => {
	if (libraryPanel.classList.contains('show')) showLibrary();
	if (infoPanel.classList.contains('show')) showInfo();
  saveAlert.style.display = "none";
  savePanel.classList.toggle('show');
  saveInput.value = '';

  if (savePanel.classList.contains('show')) {
    saveInput.focus();

		adjustmentPanels.forEach((panel, index) => hideAdjustments(index));
  }
} // #####

const showLibrary = () => {
	if (savePanel.classList.contains('show')) showSave();
	if (infoPanel.classList.contains('show')) showInfo();
	libraryPanel.classList.toggle('show');

	if (libraryPanel.classList.contains('show')) {
		showSavedPalettes();
		adjustmentPanels.forEach((panel, index) => hideAdjustments(index));

		if (palettes.length > 0) {
			[...palettes].forEach((palette) => {
				let colors = palette.children[1].children;
				palette.addEventListener("click", () => displayPalette([...colors]));
				palette.addEventListener("keyup", (event) => {
					if (event.keyCode === 13) {
						displayPalette([...colors]);
					}
				});	
			});
		}

		deleteListeners();
		closeLibrary.focus();
	}
} // #####

const showAdjustments = (index) => {
	adjustmentPanels[index].style.display = "flex";
	originalExample[index].style.backgroundColor = initialColors[index];
} // #####

const hideAdjustments = (index) => {
	adjustmentPanels[index].style.display = "none";
} // #####

const showInfo = () => {
	if (libraryPanel.classList.contains('show')) showLibrary();
	if (savePanel.classList.contains('show')) showSave();
	
	infoPanel.classList.toggle("show");
	adjustmentPanels.forEach((panel, index) => hideAdjustments(index));
	if (infoPanel.classList.contains('show')) {
		closeInfo.focus();

}
} // #####


/* Display initial colors */
displayColors();

/* ########## Event Listeners ######### */
lockButtons.forEach((lock, index) => {
	lock.addEventListener("click", () => lockColor(index));
});

adjustmentButtons.forEach((btn, index) => {
	btn.addEventListener("click", () => showAdjustments(index));
});

closeAdjustment.forEach((close, index) => {
	close.addEventListener("click", () => hideAdjustments(index));
}); 

generate.addEventListener("click", displayColors);
save.addEventListener("click", showSave);
closeSave.addEventListener("click", showSave);
saveBtn.addEventListener("click", savePalette);
library.addEventListener("click", showLibrary);
closeLibrary.addEventListener("click", showLibrary);

sliders.forEach((slider) => {
	slider.addEventListener("input", hslControls);
});

changeButtons.forEach((btn, index) => {
	btn.addEventListener("click", () => changeOriginal(index));
});

info.addEventListener("click", showInfo);
closeInfo.addEventListener("click", showInfo);
