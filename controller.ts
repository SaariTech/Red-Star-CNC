
const c_red_background = "\x1b[41m";
const c_yellow = "\x1b[33m";
const c_white = "\x1b[37m";
const c_fill = '\x1B[K';

console.log(c_yellow + ' ' + c_red_background + c_fill);

const machine = require("./machine");
const fs = require("fs");

fs.writeFileSync("data/pause.txt", "0", { flag: "w" });

setTimeout(() => {
	fs.readdirSync('./gcode').forEach((file: string) => {
		console.log('Maskin: Kontrollerar ' + file);
		if(file.indexOf('.gcode') != -1)
			machine.ExpandFromFile('./gcode/' + file);
	});
	setTimeout(() => {
		machine.Start(null, 0);
	}, 1000);
}, 1000);