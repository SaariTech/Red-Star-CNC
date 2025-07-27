// usb-cli.ts
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import * as readline from 'node:readline';

const port = new SerialPort({
  path: '/dev/ttyUSB0',
  baudRate: 115200,
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

port.on('open', () => {
  console.log('Port öppen. $ för hjälp och ? för maskin status. Skriv ett kommando:');
  rl.prompt();
});

port.on('error', (err) => {
  console.error('Fel:', err.message);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '>> ',
});

parser.on('data', (data) => {
  console.log(`< ${data}`);
  rl.prompt();
});

rl.on('line', (line) => {
  if (line.trim() === ':q') {
    rl.close();
    port.close();
    return;
  }

  port.write(line + '\r\n', (err) => {
    if (err) {
      console.error('Fel vid skrivning:', err.message);
    }
  });
});

rl.on('close', () => {
  console.log('\nAvslutar...');
  port.close();
});
