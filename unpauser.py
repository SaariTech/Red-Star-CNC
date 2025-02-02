#!/usr/bin/python3

import RPi.GPIO as GPIO
import time

input = 16

GPIO.setmode(GPIO.BCM)
GPIO.setup(input, GPIO.IN, pull_up_down=GPIO.PUD_UP)

while True:
	time.sleep(1)
	if GPIO.input(input) == 0:
		f = open("data/pause.txt", "w")
		f.write("0")
		f.close()