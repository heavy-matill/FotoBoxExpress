# FotoBoxExpress

## Third party tool instructions

### Make and install libgphoto2 and gphoto2
These isntructions are necessary only if you want to modify the libgphoto library. 
It was necessary to reduce waiting-for-file-time from 35s to 5s in case my Sony Alpha 7III did not catch a focus. 
Tested on my RPi 4b.

#### Modifications for Sony MTP cameras with short exposure
In case you are using a Sony camera via MTP, it's camlib will wait for the file to be available. 
In case of long exposure this can take up to 30 seconds, which is why the gphoto2 also waits 30 seconds in case of an error. 
If you are using short exposure times only, you may want to reduce that parameter. 
It can be modified by editing `libgphoto2-X.X.X/camlibs/ptp2/library.c`:
```
sudo nano camlibs/ptp2/library.c
```
searching for:
```
	/* 30 seconds are maximum capture time currently, so use 30 seconds + 5 seconds image saving at most. */
	} while (time_since (event_start) < 35000);
```

#### Install dependencies
```
sudo apt-get install libltdl-dev libusb-dev libusb-1.0 libexif-dev libpopt-dev
```
Make sure you do not have any versions of libgphoto2 or gphoto2 installed if you want to make this build your default later.

#### Download and unpack latest libgphoto2
```
wget http://downloads.sourceforge.net/project/gphoto/libgphoto/2.5.23/libgphoto2-2.5.23.tar.gz
tar -xvzf libgphoto2-2.5.23.tar.gz
cd libgphoto2-2.5.23
```
Newest version available at https://sourceforge.net/projects/gphoto/files/libgphoto/.

#### Configure, make and install
Configure according to https://github.com/gphoto/libgphoto2/blob/master/INSTALL
```
./configure --prefix=/usr/local
make
sudo make install
cd ..
```
If you want to compile only one or two specific camlibs, run something like
```
make -C camlibs canon.la ptp2.la
```
#### Download and unpack latest gphoto2
```
wget http://downloads.sourceforge.net/project/gphoto/2.5.23/gphoto2-2.5.23.tar.gz
tar -xvzf gphoto2-2.5.23.tar.gz
cd gphoto2-2.5.23
```
Newest version available at https://sourceforge.net/projects/gphoto/files/gphoto/

#### Configure, make and install
Again configure but use sudo for permissions
```
sudo ./configure --prefix=/usr/local
sudo make
sudo make install
cd ..
```
You now have gphoto2 installed to `/usr/local/bin` it will not be available unless you add it to your `PATH` with
```
PATH=$PATH:/usr/local/bin
```
#### Sources
Credits to:
https://github.com/gphoto/libgphoto2/blob/master/INSTALL
https://hyfrmn.wordpress.com/2015/02/03/install-libgphoto2-and-gphoto2-from-source-on-raspberry-pi/
