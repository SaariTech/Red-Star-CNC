
const c_red_background = "\x1b[41m";
const c_yellow = "\x1b[33m";
const c_white = "\x1b[37m";
const c_fill = '\x1B[K';

console.log(c_yellow + ' ' + c_red_background + c_fill);

const machine = require("./machine");
const fs = require("fs");

fs.writeFileSync("data/pause.txt", "1", { flag: "w" });

let files: string[] = [];
let fileIndex: number = 0;

function ProcessGcodeFiles()
{
    files = fs.readdirSync('./gcode');
	ReadNextFile();
	//machine.Start(null, 0);
}

function ReadNextFile()
{
	if(fileIndex < files.length)
	{
		console.log('Maskin: Kontrollerar ' + files[fileIndex]);
		if (files[fileIndex].indexOf('.gcode') != -1)
		{
			console.log('Maskin: OK');
			machine.ExpandFromFile('./gcode/' + files[fileIndex], ReadNextFile);
		}
		else
		{
			console.log('Maskin: Ignorerar ' + files[fileIndex]);
		}
		fileIndex++;
	}
	else
	{
		console.log("start");
	}
}

ProcessGcodeFiles();