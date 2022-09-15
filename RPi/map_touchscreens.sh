#!/bin/sh
# make sure this script is executable (chmod +x map_touchscreens.sh)
# paste: ACTION=="add", ATTRS{name}=="UsbHID SingWon-CTP-V1.18B", RUN+="/home/pi/FotoBoxExpress/RPi/map_touchscreens.sh"
# to sudo nano /etc/udev/rules.d/99-z-custom.rules
# apply with: sudo udevadm control --reload-rules
# test with: sudo udevadm trigger /dev/input/event0
# map touchscreens
export DISPLAY=":0"
export XAUTHORITY="/home/pi/.Xauthority"

echo "###########################################" >> /home/pi/FotoBoxExpress/RPi/log.txt
#date >> /home/pi/FotoBoxExpress/RPi/log.txt
#env >> /home/pi/FotoBoxExpress/RPi/log.txt
#file "/sys${DEVPATH}" >> /home/pi/FotoBoxExpress/RPi/log.txt
#sleep 10
# xinput --list-props 'pointer:UsbHID SingWon-CTP-V1.18B' >> /home/pi/FotoBoxExpress/RPi/log.txt
xinput map-to-output 'pointer:UsbHID SingWon-CTP-V1.18B' HDMI-1 >> /home/pi/FotoBoxExpress/RPi/log.txt 2>&1
#xinput set-prop 'pointer:UsbHID SingWon-CTP-V1.18B' 'libinput Calibration Matrix' -1 0 1 0 -1 1 0 0 1 >> /home/pi/FotoBoxExpress/RPi/log.txt 2>&1
xinput map-to-output 'pointer:ILITEK ILITEK-TP' HDMI-2 >> /home/pi/FotoBoxExpress/RPi/log.txt 2>&1
xinput --list-props 'pointer:UsbHID SingWon-CTP-V1.18B' >> /home/pi/FotoBoxExpress/RPi/log.txt 2>&1
