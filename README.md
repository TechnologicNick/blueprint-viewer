# blueprint-viewer
A 3D viewer for Scrap Mechanic blueprints

![Blueprint Viewer Blueprint](https://i.imgur.com/oylWqsP.png)

## What to use it for
You can use it to export to a `.glb` file. This is a file format that contains all models and textures in a single file. You can then upload this to Sketchfab to add the model and textures the workshop page of your blueprint. [Example](https://steamcommunity.com/sharedfiles/filedetails/?id=851799780)

## Installation
I'm using electronforge to create an installation. However I don't know how to use it correctly so when you do `npm run make` it takes a very long time and the result won't load anyway.

It currently only works by cloning the git and running `npm i` to install all the required modules. You can then run it using `npm run start` to start it. It currently loads a hardcoded blueprint which you'll have to change. The path can be found in `/src/renderer/index.js`.

## TODO
* [ ] Cache textures for colors so they're not re-rendered for every blocks/part
* [ ] Add texture coordinates to blocks
