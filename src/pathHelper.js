const { dialog } = require("electron");
const regedit = require("regedit");
const path = require("path");
const fs = require("fs");

class PathHelper {
    static STEAM_DIR;
    static WORKSHOP_DIR;
    static INSTALLATION_DIR;

    static GAME_DATA;
    static SURVIVAL_DATA;
    static CHALLENGE_DATA;

    static USER_DIR;
    static USER_BLUEPRINTS_DIR;
    static USER_CHALLENGES_DIR;
    static USER_MODS_DIR;
    static USER_PROGRESS_DIR;
    static USER_SAVE_DIR;
    static USER_TILES_DIR;
    static USER_WORLDS_DIR;



    static isValidSMInstallDir(dir) {
        // console.log("Validating", dir);
        return fs.existsSync(path.join(dir, "Release", "ScrapMechanic.exe"));
    }

    static findSteamInstallation() {
        return new Promise((resolve, reject) => {
            regedit.list("HKLM\\SOFTWARE\\WOW6432Node\\Valve\\Steam", (err, result) => { //TODO: Test this on 32bit windows
                
                if (err !== null) {
                    console.error("Error getting the Steam install directory from the registry", err);
                    reject(err.message);
                    return;
                }

                this.STEAM_DIR = Object.values(result)[0].values.InstallPath.value;
                this.WORKSHOP_DIR = path.join(this.STEAM_DIR, "steamapps", "workshop", "content", "387990");
                
                resolve(this.STEAM_DIR);
            });
        });
    }

    static getSteamLibraryFolders() {
        let libFol = [ this.STEAM_DIR ];

        let vdf = fs.readFileSync(path.join(this.STEAM_DIR, "steamapps", "libraryfolders.vdf")).toString();
        let matches = Array.from(vdf.matchAll(/^\t"\d+"\t\t"(.*?)"$/gm));

        // console.log(Array.from(matches));
        for (let m of matches) libFol.push(m[1].replace("\\\\", path.sep));

        return libFol;
    }

    static async findScrapMechanicInstallation() {
        await this.findSteamInstallation();
        // console.log(this);

        for (let lf of this.getSteamLibraryFolders()) {
            let inst = path.join(lf, "steamapps", "common", "Scrap Mechanic");

            if (this.isValidSMInstallDir(inst)) {
                this.INSTALLATION_DIR = inst;
                break;
            }
        }
        // console.log(this);

        return this.INSTALLATION_DIR;
    }

    static async selectSMInstallDir() {
        while (true) {
            try {
                let result = await dialog.showMessageBox(undefined, {
                    message: "Unable to find the Scrap Mechanic installation. Do you want to select the installation directory manually?",
                    buttons: ["Cancel", "Yes"],
                    defaultId: 1,
                    title: "Error",
                    type: "error"
                })

                let inst;
            
                if (result.response === 1) { // Yes
                    let selectedDirs = dialog.showOpenDialogSync(undefined, {
                        defaultPath: this.STEAM_DIR,
                        title: "Select Scrap Mechanic installation directory",
                        properties: ["openDirectory"]
                    });

                    if (selectedDirs === undefined) return false // Selection canceled
                    inst = selectedDirs[0]; // Returns an array with one element
                } else { // Did not want to select manually
                    return false;
                }
                
                // Validate if the found or selected directory contains the /Release/ScrapMechanic.exe
                if (this.isValidSMInstallDir(inst)) {
                    this.INSTALLATION_DIR = inst;
                    return true;
                } else {
                    // The directory was not valid
                    continue;
                }

            } catch(err) {
                console.error("Failed selecting installation directory", err);
                await dialog.showErrorBox("Failed selecting installation directory", err);

                // Stopping the application
                return false;
            }
        }
    }

    static async findOrSelectSMInstallDir() {

        try {
            await this.findScrapMechanicInstallation();
        } catch (err) {
            console.log("Failed to find Scrap Mechanic installation directory:", err);
            return this.selectSMInstallDir();
        }

        // Continuing the launch
        return true;
    }

    static findUserDir() {
        let base = path.join(process.env.APPDATA, "Axolot Games", "Scrap Mechanic", "User");

        this.USER_DIR = fs.readdirSync(base) // Get all files and directories
            .filter(dir => dir.match(/^User_\d+$/g)) // Check if it matches a Steam id
            .map(dir => path.join(base, dir)) // Combine the base and directory name
            .filter(dir => fs.lstatSync(dir).isDirectory()) // Check if it's a directory
            .sort((a, b) => fs.statSync(b).mtime - fs.statSync(a).mtime) // Sort by modified date (high to low)
            [0]; // Return the first
        
        // Set the other user directories
        if (this.USER_DIR) {
            for (let name of ["Blueprints", "Challenges", "Mods", "Progress", "Save", "Tiles", "Worlds"]){
                let dir = path.join(this.USER_DIR, name);
                if (fs.existsSync(dir)) {
                    this[`USER_${name.toUpperCase()}_DIR`] = dir;
                }
            }
        }

        console.log(this);
        return this.USER_DIR;
    }



    static updatePaths() {
        this.GAME_DATA = path.join(this.INSTALLATION_DIR, "Data");
        this.SURVIVAL_DATA = path.join(this.INSTALLATION_DIR, "Survival");
        this.CHALLENGE_DATA = path.join(this.INSTALLATION_DIR, "ChallengeData");
    }

    static expandPathPlaceholders(p) {
        return p.replace("$GAME_DATA", this.GAME_DATA)
                .replace("$SURVIVAL_DATA", this.SURVIVAL_DATA)
                .replace("$CHALLENGE_DATA", this.CHALLENGE_DATA);
    }
}

module.exports = PathHelper;