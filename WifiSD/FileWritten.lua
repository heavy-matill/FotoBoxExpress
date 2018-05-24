local folder    = "DCIM"         -- What folder to upload files from
local server    = "192.168.1.1"     -- The FTP server's IP
local url 		= "http://192.168.1.1:8000/newfoto/"
--local url 		= "http://192.168.178.104:8000/newfoto/"

local newestSubFolder = ""
local newestFile = ""

-- For each file in folder...
for subFolder in lfs.dir(folder) do
    -- Get that file's attributes
    attr = lfs.attributes(folder .. "/" .. subFolder)
    -- Check if subFolder is folder
    if attr.mode ~= "file" then
		-- set newestSubFolder to current subFolder to get the last subFolder in folder
		newestSubFolder = subFolder
	end
end
for file in lfs.dir(folder .. "/" .. newestSubFolder) do
	extension = file:match "[^.]+$"
	if(extension == "JPG" or extension == "jpg") then
		newestFile = file
	end
end
print("The newest file is: " .. newestSubFolder .. "/" .. newestFile)
fa.request(url .. newestSubFolder .. "/" .. newestFile)
