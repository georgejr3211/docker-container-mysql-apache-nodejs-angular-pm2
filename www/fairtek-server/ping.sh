#!/bin/bash

wget -q --spider 192.168.0.110

if [ $? = 0 ]; then
    echo "Online"
else
    echo "Offline"
    nmcli con up Oficina5
fi
