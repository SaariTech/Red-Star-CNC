#!/bin/bash

if [[ $UID != 0 ]]; then
    echo "Kör det här skriptet med sudo:"
	echo ""
    echo "sudo $0 $*"
	echo ""
    exit 1
fi

if ! ps ax | grep -q "python3 unpauser.py"; then
	sudo nohup python3 unpauser.py &
fi

sudo ts-node controller.ts