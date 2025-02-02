const SerialPort = require("serialport").SerialPort;
const fs = require("fs");

const DEBUG_NO_SPIN = true;

const c_yellow = "\x1b[33m";
const c_white = "\x1b[37m";
const c_fill = '\x1B[K';

console.log('☆                       ☆', c_fill);
console.log(c_fill);
console.log('   Fred och framsteg     ', c_fill);
console.log(c_fill);
console.log('☆                       ☆', c_fill);

function sleep(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

const usbPort = new SerialPort(
	{
		path: '/dev/ttyUSB0',
		baudRate: 115200
	}
);

usbPort.on("open", function()
{
	usbPort.on('data', function(data: string)
	{
		Log('Mottagen', data + c_fill);
		NextCommand();
	});
	console.log(c_fill);
	console.log('  USB Port:', usbPort.path + c_fill);
	console.log('  Baud Rate:', usbPort.baudRate + c_fill);
	console.log(c_fill);
});

interface IMap
{
	x: number;
	y: number;
	z: number;
}

let max_rpm: number = 10000;
let lastMap: IMap;
let pauseOffset: IMap = {x: 0, y: 0, z: 0};
let commands: string[] = [];
let commandIndex: number = 0;
let rpm: number = 10000;
let map: IMap[][] = [];
let pause: boolean = false;
let pauseMap: IMap;
let completeDelegate: any = null;

pauseOffset.x = 5;
pauseOffset.y = 5;
pauseOffset.z = 5;

if(DEBUG_NO_SPIN)
	rpm = 0;

setInterval(()=> { 
	if(pause)
	{
		fs.readFile('data/pause.txt', 'utf8', (error: any, data: string) =>
		{
			if(data == '0')
			{
				pause = false;
				NextCommand();
			}
		});
	}
}, 1000);

export function ClearCommands()
{
	commands.splice(0, commands.length);
	commandIndex = 0;
}

export function AddCommands(command: string)
{
	commands.push(command);
}

export function ExpandFromFile(file: string, callback: any = null)
{
	fs.readFile(file, 'utf8', (error: any, data: string) =>
	{
		if(error)
		{
			console.log(error);
			return;
		}

		pauseMap = {x: 0, y: 0, z: 0};
		lastMap = {x: 0, y: 0, z: 0};

		const gcode: string[] = data.split('\n');
		let i = 0;

		for(; i < gcode.length; i++)
		{
			const d = gcode[i].split(' ');
			if(d.length > 1 && d[1][0] == 'G')
			{
				for(let j = 0; j < d.length; j++)
				{
					switch(d[j][0])
					{
						case 'X':
							const x = Number(d[j].replace('X', ''));
							if(pauseMap.x < x)
								pauseMap.x = x;
							break;
						case 'Y':
							const y = Number(d[j].replace('Y', ''));
							if(pauseMap.y < y)
								pauseMap.y = y;
							break;
					}
				}
				AddCommands(gcode[i].replace(d[0], ''));
			}
			else if(d.length > 1 && d[2] == 'M03')
			{
				if(!DEBUG_NO_SPIN)
				{
					rpm = Number(d[1].replace('S', ''));
					
					if(rpm > max_rpm)
						rpm = max_rpm;
					
					AddCommands(gcode[i].replace(d[0], ''));
				}
			}
		}

		if(!DEBUG_NO_SPIN)
			AddCommands('M5');

		AddCommands('G00 Z' + pauseOffset.z.toString());
		AddCommands('G00 X' + (pauseMap.x + pauseOffset.x).toString() + ' Y' + (pauseMap.y + pauseOffset.y).toString());
		AddCommands('PAUSE');

		Log('Maskin', 'Utökat Gcode från "' + file + '"');
		if(callback != null)
			callback();
	});
}

export function Start(setCompleteDelegate: any, startIndex: number = -1)
{
	completeDelegate = setCompleteDelegate;
	commandIndex = startIndex;
	NextCommand();
}

export function StopSpin()
{
	if(!DEBUG_NO_SPIN)
		Send('M5', 0, 1);
}

export function StartSpin()
{
	if(!DEBUG_NO_SPIN)
		Send('M3 S' + rpm.toString(), 0, 1);
}

export function DrawMap()
{
	map.splice(0, map.length);
}



async function NextCommand(): Promise<void>
{
	commandIndex++;
	if(commandIndex < commands.length - 1)
	{
		Send(commands[commandIndex], commandIndex, commands.length);
	}
	else
	{
		Log('Maskin', 'Arbete utfört');
		if(completeDelegate != null)
		{
			const completeCallback = completeDelegate;
			completeDelegate = null;
			completeCallback();
		}

		process.exit(1)
	}
}

async function Send(command: string, index: number, length: number, status: string = 'Kommando'): Promise<void>
{
	if(command == "PAUSE")
	{
		fs.writeFileSync("data/pause.txt", "1", { flag: "w" });
		Log(status, command + ' | ' + Pad((index + 1), length.toString().length) + ' / ' + length.toString());
		pause = true;
		return;
	}

	usbPort.write(command + '\n', (err: Error | null) => {
		if (err) return Log('Fel: ', err.message);
		Log(status, command + ' | ' + Pad((index + 1), length.toString().length) + ' / ' + length.toString());

		const d = command.split(' ');
		if(d.length > 1 && d[1][0] == 'G')
		{
			for(let j = 0; j < d.length; j++)
			{
				switch(d[j][0])
				{
					case 'X': lastMap.x = Number(d[j].replace('X', '')); break;
					case 'Y': lastMap.y = Number(d[j].replace('Y', '')); break;
					case 'Z': lastMap.z = Number(d[j].replace('Z', '')); break;
				}
			}
		}
	});
}

function Pad(num: number, size: number)
{
	let s = num + '';
	while (s.length < size) s = '0' + s;
	return s;
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