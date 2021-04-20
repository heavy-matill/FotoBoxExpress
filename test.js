const sharp = require('sharp')
async function main() {
	const inFile = 'in.jpg'
	sharpFile = await sharp(inFile)
	metadata = await sharpFile.metadata()
	const strDate = '2019-08-05'
	const strEvent = 'Geburtstag'
	const imWidth = metadata.width
	const imHeight = metadata.height
	const svgTextWidth = 20
	const svgWidth = imWidth + svgTextWidth*2 
	const svgHeight = imHeight
	console.log(metadata)
	var textSVG = new Buffer('<svg height="'
		+svgHeight
		+'" width="'
		+svgWidth
		+'">'
		+'<text x="'
			+(svgWidth-0.25*svgTextWidth)
			+'" y="'
			+svgHeight
			+'" transform="rotate(-90,'
			+(svgWidth-0.25*svgTextWidth)
			+','
			+svgHeight
			+')" font-size="16" fill="#000">'
			+strDate
		+'</text>'
		+'<text x="'
			+(svgWidth-0.25*svgTextWidth)
			+'" y="'
			+0
			+'" transform="rotate(-90,'
			+(svgWidth-0.25*svgTextWidth)
			+','
			+0
			+')" font-size="16" fill="#000" text-anchor="end" >'
			+inFile
		+'</text>'
		+'<text x="'
			+(svgTextWidth*0.75)
			+'" y="'
			+svgHeight
			+'" transform="rotate(-90,'
			+(svgTextWidth*0.75)
			+','
			+svgHeight
			+')" font-size="16" fill="#000">'
			+strEvent
		+'</text>'
		+'</svg>');
	await sharpFile.extend({top: 0,bottom: 0,left: svgTextWidth, right: svgTextWidth,  background: { r: 255, g: 255, b: 255, alpha: 1.0 }  }).overlayWith(textSVG, {gravity: 'center'}).toFile('test.jpg')
}
main()