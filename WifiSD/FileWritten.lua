local folder    = "DCIM"         -- What folder to upload files from
local url 		= "http://192.168.1.1:8000/newfoto/"
--local url 		= "http://192.168.178.123:8000/newfoto/"

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
-- get current ip https://flashair-developers.com/en/documents/api/lua/#ip
ip, mask, gw = fa.ip()

local request_body = "http://" .. ip .. "/" .. folder .. "/" .. newestSubFolder .. "/" .. newestFile
fa.request{url = "http://192.168.1.1:8000/newfoto/", 
 headers = {["Content-Type"] = "application/x-www-form-urlencoded", ["Content-Length"] = string.len(request_body)}, 
 method="POST",
 body = request_body
 }