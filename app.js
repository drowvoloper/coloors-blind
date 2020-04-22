const hexCodes = document.querySelectorAll('.color__code');
const hexPro = document.querySelectorAll('.color--protanopia');
const hexDeu = document.querySelectorAll('.color--deuteranopia');
const hexTri = document.querySelectorAll('.color--tritanopia');

/*
* https://github.com/skratchdot/color-blind
* "Simulate color blindness by converting RGB hex codes"
*/
const blinder = require('color-blind');

const generateColor = () => {
	const color = {};
	color.original = chroma.random().hex();
	color.protanopia = blinder.protanopia(color.original);
	color.deuteranopia = blinder.deuteranopia(color.original);
	color.tritanopia = blinder.tritanopia(color.original);

	return color;
}

const displayColors = () => {
	hexCodes.forEach((code, index) => {
		const color = generateColor();
		code.innerText = color.original;
		code.parentNode.style.backgroundColor = color.original;
		hexPro[index].style.backgroundColor = color.protanopia;
		hexDeu[index].style.backgroundColor = color.deuteranopia;
		hexTri[index].style.backgroundColor = color.tritanopia;
	});
}

displayColors();

// contrast
// generate
// lock
// HTML -> original / prot / deut / trit
