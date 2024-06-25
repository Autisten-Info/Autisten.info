const fs = require('fs');
const path = require('path');

// Argumente aus der Kommandozeile einlesen
const exportDir = process.argv[2];

// Pfad zum Quelldateiordner und zum Zielverzeichnis
const sourceDir = path.join(__dirname, 'autisten-info-bootstrap', 'assets');
const destDir = path.join(exportDir, '..', 'autisten-info-nuxt', 'assets');
const nuxtConfigPath = path.join(exportDir, '..', 'autisten-info-nuxt', 'nuxt.config.ts');
const componentsDir = path.join(exportDir, '..', 'autisten-info-nuxt', 'components');

// Funktion zum Kopieren des Ordners
function copyFolderSync(from, to) {
    fs.mkdirSync(to, { recursive: true });
    fs.readdirSync(from).forEach(element => {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);
        if (fs.lstatSync(fromPath).isFile()) {
            fs.copyFileSync(fromPath, toPath);
            console.log(`Copied file: ${fromPath} to ${toPath}`);
        } else if (fs.lstatSync(fromPath).isDirectory()) {
            copyFolderSync(fromPath, toPath);
            console.log(`Copied directory: ${fromPath} to ${toPath}`);
        }
    });
}

// Funktion zum Überschreiben der CSS-Konfiguration in nuxt.config.ts
function updateNuxtConfig(configPath) {
    const cssDir = path.join(exportDir, '..', 'autisten-info-nuxt', 'assets', 'css');
    const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css')).map(file => `@/assets/css/${file}`);
    
    let configContent = fs.readFileSync(configPath, 'utf8');

    const cssSection = `css: [${cssFiles.map(file => `'${file}'`).join(', ')}]`;
    configContent = configContent.replace(/css: \[.*?\]/s, cssSection);

    fs.writeFileSync(configPath, configContent, 'utf8');
    console.log(`Updated nuxt.config.ts with CSS files: ${cssFiles.join(', ')}`);
}

// Funktion zum Extrahieren von Vue-Komponenten aus HTML-Dateien
function extractVueComponents(htmlDir, targetDir) {
    fs.readdirSync(htmlDir).forEach(file => {
        if (file.endsWith('.html')) {
            const filePath = path.join(htmlDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');

            const componentRegex = /<!-- Start: (.*?) -->[\s\S]*?<!-- End: \1 -->/g;
            let match;
            while ((match = componentRegex.exec(fileContent)) !== null) {
                const componentPath = match[1].trim();
                if (componentPath.endsWith('.vue')) {
                    const componentContent = match[0]
                        .replace(`<!-- Start: ${componentPath} -->`, '')
                        .replace(`<!-- End: ${componentPath} -->`, '')
                        .trim();

                    const fullComponentPath = path.join(targetDir, componentPath);
                    fs.mkdirSync(path.dirname(fullComponentPath), { recursive: true });

                    if (fs.existsSync(fullComponentPath)) {
                        // Datei existiert, <template> Inhalt überschreiben
                        let existingContent = fs.readFileSync(fullComponentPath, 'utf8');
                        const templateRegex = /<template>[\s\S]*?<\/template>/;

                        if (templateRegex.test(existingContent)) {
                            existingContent = existingContent.replace(templateRegex, `<template>\n${componentContent}\n</template>`);
                            fs.writeFileSync(fullComponentPath, existingContent, 'utf8');
                            console.log(`Updated existing component: ${fullComponentPath}`);
                        } else {
                            existingContent = `<template>\n${componentContent}\n</template>\n` + existingContent;
                            fs.writeFileSync(fullComponentPath, existingContent, 'utf8');
                            console.log(`Added template to existing component: ${fullComponentPath}`);
                        }
                    } else {
                        // Datei existiert nicht, neue Datei erstellen
                        fs.writeFileSync(fullComponentPath, `<template>\n${componentContent}\n</template>`, 'utf8');
                        console.log(`Created new component: ${fullComponentPath}`);
                    }
                }
            }
        }
    });
}

// Hauptfunktion
function main() {
    // Kopieren des assets-Ordners
    if (fs.existsSync(sourceDir)) {
        copyFolderSync(sourceDir, destDir);
    } else {
        console.log(`${sourceDir} does not exist.`);
    }

    // Aktualisieren der nuxt.config.ts
    if (fs.existsSync(nuxtConfigPath)) {
        updateNuxtConfig(nuxtConfigPath);
    } else {
        console.log(`${nuxtConfigPath} does not exist.`);
    }

    // Extrahieren von Vue-Komponenten aus HTML-Dateien
    if (fs.existsSync(exportDir)) {
        extractVueComponents(exportDir, componentsDir);
    } else {
        console.log(`${exportDir} does not exist.`);
    }
}

// Skript ausführen
main();
