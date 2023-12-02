#!/bin/bash

npm install
npm run migrate:ts up

tail -f /dev/null

# create a override to test logs
#npm run start:dev