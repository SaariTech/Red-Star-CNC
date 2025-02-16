# Red Star CNC  
En revolutionär GRBL-kontroller med kommunistisk tema  
*Fred, framsteg och frihet genom öppen mjukvara*

---

## Välkommen till Red Star CNC  
Red Star CNC är mer än bara ett program – det är en rörelse. Med vår GRBL-kontroller sätter vi makten i händerna på folket. Genom öppen och fri mjukvara möjliggör vi för alla att skapa, innovera och bidra till en framtid där teknik är tillgänglig för alla. 

**"Programvara är öppen och fri, som i frihet."**  

---

## Funktioner
- **Automatisering av CNC-maskiner**: Kör `.gcode`-filer i ordning från `./gcode/`-katalogen.
- **Automatisk paus och manuell återuppta**: En switch-knapp kopplad till GPIO 16 och GND låter dig kontrollera processen.
- **Öppen källkod**: Frihet att anpassa, förbättra och dela med dig av projektet.
- **Kommunistisk tema**: En hyllning till jämlikhet, samarbete och teknisk framsteg för alla.

---

## Hårdvara
- **Raspberry Pi**: Hjärtat i vår revolutionära lösning.
- **Testad CNC-maskin**: CNC 3018 – en maskin för folket.
- **Switch-knapp**: Kopplad mellan GPIO 16 och GND i Raspberry Pi för att fortsätta körningen mellan `.gcode` filer.

---

## Programvara
- **Blender CAM**: För att generera G-code.
- **Mach3**: Enkel och effektiv postprocessor som finns i Blender CAM.
- **Filformat**: `.gcode` – enkelt och universellt.
- **Ubuntu**: Ett fritt och öppet Linux-operativsystem.

---

## G-code-körning
CNC-maskinen kör varje `.gcode`-fil i ordning från `./gcode/`-katalogen, med en paus mellan varje fil. Tryck på switch-knappen för att fortsätta arbetet – under pauset kan folket byta fräsar.

---

## Installationsinstruktioner
1. Anslut din Raspberry Pi till CNC-maskinen.
2. Installera nödvändliga program `sudo apt install ts-node python3-dev python3-rpi.gpio`
3. Koppla en switch-knapp mellan GPIO 16 och GND på Raspberry Pi.
4. Placera alla `.gcode`-filer i `./gcode/`-katalogen.
5. Skicka kommando `sudo ./start_machine.sh` och låt revolutionen börja!

---

## Varför Red Star CNC?
- **Frihet**: Mjukvaran är öppen och fri – ingen begränsning, ingen kontroll.
- **Gemenskap**: Vi tror på samarbete och delning av kunskap.
- **Framsteg**: Teknik ska vara en kraft för positiv förändring i världen.

---

## Bidra till revolutionen
Vi välkomnar alla som vill bidra till projektet. Oavsett om du är en erfaren utvecklare eller en entusiastisk nybörjare – ditt bidrag är välkomna!  

Tillsammans bygger vi en bättre framtid!

![Screenshot](https://raw.githubusercontent.com/SaariTech/Red-Star-CNC/refs/heads/main/screenshot.webp)


---

## Licens
Detta projekt är licensierat under [MIT-licensen](LICENSE) – frihet för alla att använda, modifiera och dela.  

---

*En maskin för folket och av folket.*
