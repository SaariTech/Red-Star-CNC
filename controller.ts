
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

function sleep(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

function Log(status: string, data: string)
{
	console.log(c_white + c_yellow + ' ' + DateNow() + ' ' + c_white + status + ':', data + c_fill);
}

function DateNow(): string
{
	const date = new Date(Date.now());

	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const seconds = date.getSeconds().toString().padStart(2, '0');

	return `${hours}:${minutes}:${seconds}`;
}

function ProcessGcodeFiles()
{
    files = fs.readdirSync('./gcode');
	ReadNextFile();
}

function ReadNextFile()
{
	if(fileIndex < files.length)
	{
		Log('Maskin', files[fileIndex]);
		if (files[fileIndex].indexOf('.gcode') != -1)
			{
				Log('Maskin', 'OK');
				fileIndex++;
				machine.ExpandFromFile('./gcode/' + files[fileIndex - 1], ReadNextFile);
			}
			else
			{
				fileIndex++;
				Log('Maskin', 'Ignorerar ' + files[fileIndex - 1]);
				ReadNextFile();
			}
		}
	else
	{
		machine.Start(null, 0);
	}
}

machine.Connect(ProcessGcodeFiles);