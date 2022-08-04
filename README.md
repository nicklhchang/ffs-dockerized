Dockerized for demo purposes. In production, Docker won't be used in this way.

To run this project on your own machine, Docker Desktop is required. You won't need to have node or MongoDB installed locally.

Once cloned, create a .env file inside ./store-api (store-api sub-directory). Enter the below fields (MONGO_URI and SECRET) inside this .env file:

MONGO_URI='mongodb://ffs:ffsadmin@db:27017/ffsstore'

SECRET=replaceThisWithAnyLongStringYouWant

After the .env file is created and fields (MONGO_URI and SECRET) are filled out, start Docker Desktop. Then head to terminal and cd into the downloaded directory (ffs-dockerized).

Run "docker compose build", then run "docker compose up".

Then head to a web browser and visit http://localhost:3000 to play with the React app. 

You can also play around (e.g. insert dummy data in Postman) through admin routes (check ./store-api/routes/admin.js) at http://localhost:8000. 

If there is a port forwarding issue with Docker, check that no processes are running on your machine's ports 3000, 8080 and 49200.

To view MongoDB data (without installing MongoDB and MongoDB Compass), open up Docker Desktop, then navigate to ffs-dockerized in Containers, and open terminal for the db container; there should be a terminal icon to the right. If you are unable to find the terminal icon, or if this feature is deprecated in future versions of Docker Desktop, you will need to find the db container id. This id sits underneath 'db' and can be copied to clipboard.

Then head to terminal and run "docker exec -it id /bin/sh", where you replace id with the long string that you can now paste from your clipboard. NOTE: this command works on macOS and linux distributions which have Docker installed and which use zsh or bash in terminal. However, /bin/sh at the end of the command will be different for Windows Command Prompt and Powershell (does not use zsh or bash).

Next, after you enter the shell for the container running mongo, paste the following command:

mongosh --port 27017 "ffsstore" -u "ffs" -p

A prompt like 'Enter password: ' appears. The password has been set as 'ffsadmin', like the MONGO_URI field in .env inside the ./store-api sub-directory. Once you type in 'ffsadmin' and hit enter, you are now authenticated to use mongosh with read and write permissions (not root or superuser). For CRUD operations, please visit MongoDB docs.
