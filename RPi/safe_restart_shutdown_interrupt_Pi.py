#!/usr/bin/python
# safe_restart_shutdown_interrupt_Pi.py
#
# -----------------------------------------------------------------------------
#                 Raspberry Pi Safe Restart and Shutdown Python Script
# -----------------------------------------------------------------------------
# WRITTEN BY: Ho Yun "Bobby" Chan
# @ SparkFun Electronics
# MODIFIED: 3/18/2021
# DATE: 3/31/2020
#
#
# Based on code from the following blog and tutorials:
#
#    Kevin Godden
#    https://www.ridgesolutions.ie/index.php/2013/02/22/raspberry-pi-restart-shutdown-your-pi-from-python-code/
#
#    Pete Lewis
#    https://learn.sparkfun.com/tutorials/raspberry-pi-stand-alone-programmer#resources-and-going-further
#
#    Shawn Hymel
#    https://learn.sparkfun.com/tutorials/python-programming-tutorial-getting-started-with-the-raspberry-pi/experiment-1-digital-input-and-output
#
#    Ben Croston raspberry-gpio-python module
#    https://sourceforge.net/p/raspberry-gpio-python/wiki/Inputs/
#
# ==================== DESCRIPTION ====================
#
# This python script takes advantage of the Qwiic pHat v2.0's
# built-in general purpose button to safely reboot/shutdown you Pi:
#
#    1.) If you press the button momentarily, the Pi will reboot.
#    2.) Holding down the button for about 3 seconds the Pi will shutdown.
#
# This example also takes advantage of interrupts so that it uses a negligible
# amount of CPU. This is more efficient since it isn't taking up all of the Pi's
# processing power.
#
# ========== TUTORIAL ==========
#  For more information on running this script on startup,
#  check out the associated tutorial to adjust your "rc.local" file:
#
#        https://learn.sparkfun.com/tutorials/raspberry-pi-safe-reboot-and-shutdown-button
#
# ========== PRODUCTS THAT USE THIS CODE ==========
#
#   Feel like supporting our work? Buy a board from SparkFun!
#
#        Qwiic pHAT v2.0
#        https://www.sparkfun.com/products/15945
#
#   You can also use any button but you would need to wire it up
#   instead of stacking the pHAT on your Pi.
#
# LICENSE: This code is released under the MIT License (http://opensource.org/licenses/MIT)
#
# Distributed as-is; no warranty is given
#
# -----------------------------------------------------------------------------

import time
import RPi.GPIO as GPIO #Python Package Reference: https://pypi.org/project/RPi.GPIO/

import os
import signal
import subprocess
from subprocess import check_output

def get_pid(port):
    return int(check_output(['ss', '-ltnup', 'sport = :'+str(port)]).split(',')[-2][4:])

# Pin definition
reset_shutdown_pin = 24
led_pin = 23

# Suppress warnings
GPIO.setwarnings(False)

# Use "GPIO" pin numbering
GPIO.setmode(GPIO.BCM)

# Configure LED
GPIO.setup(led_pin,GPIO.OUT)
# Set LED high
GPIO.output(led_pin,True)

# Use built-in internal pullup resistor so the pin is not floating
# if using a momentary push button without a resistor.
GPIO.setup(reset_shutdown_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# Use Qwiic pHAT's pullup resistor so that the pin is not floating
#GPIO.setup(reset_shutdown_pin, GPIO.IN)

# modular function to restart script
def restart_script():
    import requests                                 # To use request package in current program 
    response = requests.get("http://localhost:8000/restart") 
    print(output)

# modular function to reboot Pi
def reboot():
    print("rebooting Pi")
    command = "/usr/bin/sudo /sbin/shutdown -r now"
    process = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
    output = process.communicate()[0]
    print(output)

# modular function to shutdown Pi
def shut_down():
    print("shutting down")
    command = "/usr/bin/sudo /sbin/shutdown -h now"
    process = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
    output = process.communicate()[0]
    print(output)




while True:
    #short delay, otherwise this code will take up a lot of the Pi's processing power
    time.sleep(0.5)

    # wait for a button press with switch debounce on the falling edge so that this script
    # is not taking up too many resources in order to shutdown/reboot the Pi safely
    channel = GPIO.wait_for_edge(reset_shutdown_pin, GPIO.FALLING, bouncetime=200)

    if channel is None:
        print('Timeout occurred')
    else:
        print('Edge detected on channel', channel)

        # For troubleshooting, uncomment this line to output button status on command line
        #print('GPIO state is = ', GPIO.input(reset_shutdown_pin))
        timer = 0
        delay = 0.075
        output = True
        action = 0
        while GPIO.input(reset_shutdown_pin) == False:
            if timer > 1 and action == 0:
                action = 1
                delay = 0.15
            elif timer > 2 and action == 1:
                action = 2
                # light up LED
                GPIO.output(led_pin, True)
                shut_down()
            # toggle LED
            output = not output
            GPIO.output(led_pin, output)
            timer += delay
            time.sleep(delay)
        
        # light up LED after loop
        GPIO.output(led_pin, True)
        if action == 0:
            #if <1s button press, restart script!
            restart_script()
        elif action == 1:
            #if 1s button press, reboot!
            reboot()
