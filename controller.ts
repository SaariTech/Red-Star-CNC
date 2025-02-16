
const c_red_background = "\x1b[41m";
const c_yellow = "\x1b[33m";
const c_white = "\x1b[37m";
const c_fill = '\x1B[K';

console.log(c_yellow + ' ' + c_red_background + c_fill);

const machine = require("./machine");
const fs = require("fs");

async function processGcodeFiles()
{
    const files = fs.readdirSync('./gcode');
    for (const file of files)
	{
        console.log('Maskin: Kontrollerar ' + file);
        if (file.indexOf('.gcode') != -1)
		{
			console.log('Maskin: OK');
            await machine.ExpandFromFile('./gcode/' + file);
        }
		else
		{
			console.log('Maskin: Ignorerar ' + file);
		}
    }
	
    machine.Start(null, 0);
}

// Kör funktionen
processGcodeFiles();