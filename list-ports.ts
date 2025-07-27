import { SerialPort } from 'serialport';

SerialPort.list().then(ports => {
  console.table(ports.map(p => ({
    path: p.path,
    manufacturer: p.manufacturer,
    serialNumber: p.serialNumber
  })));
});

