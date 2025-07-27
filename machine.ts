const SerialPort = require("serialport").SerialPort;
const fs = require("fs");

const DEBUG_NO_SPIN = false;
const DEBUG_NO_PAUSE = true;

const c_yellow = "\x1b[33m";
const c_white = "\x1b[37m";
const c_fill = '\x1B[K';

let date_start: number;

console.log('☆                       ☆', c_fill);
console.log(c_fill);
console.log('   Fred och framsteg     ', c_fill);
console.log(c_fill);
console.log('☆                       ☆', c_fill);

function sleep(ms: number)
{
	return new Promise( resolve => setTimeout(resolve, ms) );
}

interface IQueue<T>
{
	enqueue(item: T): void;
	dequeue(): T | undefined;
	size(): number;
}

class Queue<T> implements IQueue<T>
{
	private storage: T[] = [];

	constructor(private capacity: number = Infinity) {}

	enqueue(item: T): void
	{
		if (this.size() === this.capacity)
		{
			throw Error("Kön har nått maxkapaciteten, du kan inte lägga till fler objekt.");
		}
		this.storage.push(item);
	}
	dequeue(): T | undefined
	{
		return this.storage.shift();
	}
	size(): number
	{
		return this.storage.length;
	}
}

const usbPort = new SerialPort(
	{
		path: '/dev/ttyUSB0',
		baudRate: 115200
	}
);


export function Connect(readyCallback: any)
{
	usbPort.on("open", function()
	{
		usbPort.on('data', function(data: string)
		{
			if(data.indexOf('$') == -1)
			{
				Log('Maskin', data);
				NextCommand();
			}
			else
				Log('Maskin', data);
		});
		console.log(c_fill);
		console.log('  USB Port:', usbPort.path + c_fill);
		console.log('  Baud Rate:', usbPort.baudRate + c_fill);
		console.log(c_fill);
		setTimeout(() => {
			console.log('  Startar om 3 sekunder', c_fill);
			setTimeout(() => {
				console.log('  Startar om 2 sekunder', c_fill);
				setTimeout(() => {
					console.log('  Startar om 1 sekunder', c_fill);
					setTimeout(() => {
						console.log('', c_fill);
						console.log('☆ Revolutionen börjar nu!', c_fill);
						console.log('', c_fill);
						setTimeout(() => {
							console.log('', c_fill);
							date_start = Date.now();
							readyCallback();
						}, 1000);				
					}, 1000);
				}, 1000);
			}, 1000);
		}, 1000);
	});
}


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

const log = new Queue<string>();

pauseOffset.x = 5;
pauseOffset.y = 5;
pauseOffset.z = 5;

if(DEBUG_NO_SPIN)
	rpm = 0;

setInterval(()=> {
	while(0 < log.size())
		console.log(log.dequeue());


	if(pause)
	{
		log.enqueue('Pause');
		log.enqueue(DateNow() + ' | ' + WorkTime());

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

export function Ready()
{
	
}

export function ClearCommands()
{
	commands.splice(0, commands.length);
	commandIndex = 0;
}

export function AddCommands(command: string)
{
	commands.push(command);
}

export function ExpandFromFile(file: string, callback: any)
{
	fs.readFile(file, 'utf8', (error: any, data: string) => {
		if (error)
		{
			console.log(error);
			return;
		}

		pauseMap = { x: 0, y: 0, z: 0 };
		lastMap = { x: 0, y: 0, z: 0 };

		const gcode: string[] = data.split('\n');
		let haveSpinlde = false;

		for (let i = 0; i < gcode.length; i++)
		{
			if(gcode[i].indexOf('(') != -1 || !gcode[i] || gcode[i].length == 1)
				continue;
			else if(gcode[i].indexOf(';') != -1)
			{
				const code = gcode[i].split(';');
				if(code.length != 2)
					continue;
				else
					gcode[i] = code[0];
			}


			const d = gcode[i].split(' ');
			if (d.length > 1)
			{
				for (let j = 0; j < d.length; j++) {
					switch (d[j][0]) {
						case 'X':
							const x = Number(d[j].replace('X', ''));
							if (pauseMap.x < x)
								pauseMap.x = x;
							break;
						case 'Y':
							const y = Number(d[j].replace('Y', ''));
							if (pauseMap.y < y)
								pauseMap.y = y;
							break;
						case 'S':
							rpm = Number(d[j].replace('S', ''));
							if (rpm > max_rpm)
								rpm = max_rpm;

							if(rpm > 0)
								haveSpinlde = true;

							d[j] = 'S' + rpm.toString();
							break;
					}
				}

				let buildString = d[0];

				for (let s = 1; s < d.length; s++)
					buildString += ' ' + d[s];

				AddCommands(buildString);
			}
			else
				AddCommands(gcode[i]);
		}

		if(!haveSpinlde)
		{
			console.log('Inga Spindel data: ' + file);
			process.exit(0);
		}

		if(!DEBUG_NO_PAUSE)
		{
			if(!DEBUG_NO_SPIN)
				AddCommands('M5');
	
			AddCommands('G00 Z' + pauseOffset.z.toString());
			AddCommands('G00 X' + (pauseMap.x + pauseOffset.x).toString() + ' Y' + (pauseMap.y + pauseOffset.y).toString());
			AddCommands('PAUSE');
		}


		Log('Maskin', 'Utökat Gcode från "' + file + '"');
		callback();
	});
}

export function AddPause()
{
	AddCommands('M5');
	AddCommands('G00 Z' + pauseOffset.z.toString());
	AddCommands('G00 X' + (pauseMap.x + pauseOffset.x).toString() + ' Y' + (pauseMap.y + pauseOffset.y).toString());
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

async function Send(command: string, index: number, length: number): Promise<void>
{
	if(command == "PAUSE")
	{
		fs.writeFileSync("data/pause.txt", "1", { flag: "w" });
		Log('Kommando', command + ' | ' + Pad(index + 1, length.toString().length) + ' / ' + length.toString());
		pause = true;
		return;
	}

	const cmd: string = command.replace('\n', '');

	console.log(cmd.length);

	usbPort.write(command + '\n', (err: Error | null) => {
		if (err) return Log('Fel: ', err.message);
		Log('Kommando', cmd + ' | ' + Pad(index + 1, length.toString().length) + ' / ' + length.toString());

		const d = cmd.split(' ');
		if(d.length > 1)
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

function Pad(num: number, size: number): string
{
	let s = num + '';
	while (s.length < size) s = '0' + s;
	return s.toString();
}

function Log(status: string, data: string)
{
	//log.enqueue(c_yellow + ' ' + DateNow() + ' | ' + WorkTime() + ' ' + c_white + ' ' + status + ': ' + data + c_fill);
	log.enqueue(c_yellow + ' ' + status);
	log.enqueue(c_yellow + ' ' + data);
	log.enqueue(c_white + DateNow() + ' | ' + WorkTime());
}

function WorkTime(): string
{
	const date = new Date(Date.now() - date_start);

	const hours = (date.getHours() - 1).toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const seconds = date.getSeconds().toString().padStart(2, '0');

	return `${hours}:${minutes}:${seconds}`;
}

function DateNow(): string
{
	const date = new Date(Date.now());

	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const seconds = date.getSeconds().toString().padStart(2, '0');

	return `${hours}:${minutes}:${seconds}`;
}
