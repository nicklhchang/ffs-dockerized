Dockerized for demo purposes; won't need MongoDB installed on your own machine.

To run this project on your own machine, Docker Desktop is required.

Once cloned, create a .env file inside ./store-api (store-api sub-directory). Enter the below fields inside this .env file:
MONGO_URI='mongodb://ffs:ffsadmin@db:27017/ffsstore'
SECRET=replacethiswithanylongstringyouwant

After the .env file is created and MONGO_URI and SECRET fields are filled out, head to terminal and cd into the downloaded directory.

Run "docker compose build", then run "docker compose up".

Then head to a web browser and visit http://localhost:3000