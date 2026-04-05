const fs = require("node:fs/promises");
const { COMMANDS } = require("./commands");
const pathModule = require("node:path");

async function start() {
	const commandFilePath = "./command.txt";
	await clearCommand(commandFilePath);

	const watcher = fs.watch("./command.txt");

	for await (const e of watcher) {
		if (e.eventType === "change" && e.filename === "command.txt") {
			const content = await readFile("./command.txt");

			if (!content || content.length <= 0) continue;
			console.log(content);
			await runCommand(content);
			await clearCommand(commandFilePath);
		}
	}
}

async function runCommand(content) {
	if (content?.startsWith(COMMANDS.CREATE_FILE)) {
		const filePath =
			content?.substring(COMMANDS.CREATE_FILE.length)?.trim() || null;

		if (!filePath) {
			console.log("File path is not valid.");
			return;
		}

		await createFile(filePath);
		return;
	}

	if (content?.startsWith(COMMANDS.DELETE_FILE)) {
		const filePath =
			content?.substring(COMMANDS.DELETE_FILE.length)?.trim() || null;

		if (!filePath) {
			console.log("File path is not valid.");
			return;
		}

		await deleteFile(filePath);
		return;
	}

	if (content?.startsWith(COMMANDS.RENAME_FILE)) {
		const indexOfTo = content.indexOf(" to ");

		if (indexOfTo === -1) {
			console.log("Invalid command.");
			return;
		}

		const oldFilePath =
			content
				?.substring(COMMANDS.RENAME_FILE.length, indexOfTo)
				?.trim() || null;

		if (!oldFilePath) {
			console.log("Old file path is not valid.");
			return;
		}

		const newFilePath = content?.substring(indexOfTo + 4)?.trim() || null;

		if (!newFilePath) {
			console.log("New file path is not valid.");
			return;
		}

		await renameFile(oldFilePath, newFilePath);
		return;
	}

	if (content?.startsWith(COMMANDS.ADD_TO_FILE)) {
		const indexOfContent = content.indexOf(" content: ");

		if (indexOfContent === -1) {
			console.log("Invalid command.");
			return;
		}

		const filePath =
			content
				?.substring(COMMANDS.ADD_TO_FILE.length, indexOfContent)
				?.trim() || null;

		if (!filePath) {
			console.log("File path is not valid.");
			return;
		}

		const contentToAdd =
			content?.substring(indexOfContent + 10)?.trim() || null;

		if (!contentToAdd) {
			console.log("Content to add is not valid.");
			return;
		}

		await addToFile(filePath, contentToAdd);
		return;
	}

	if (content?.startsWith(COMMANDS.CLOSE)) {
		process.exit();
	}

	await clearCommand("./command.txt");
	console.log("Invalid command.");
}

async function clearCommand(path) {
	await fs.writeFile(path, "");
}

async function checkFileExists(path) {
	try {
		await fs.access(path);
		return true;
	} catch {
		return false;
	}
}

async function createFile(path) {
	try {
		const fileExists = await checkFileExists(path);

		if (fileExists) {
			console.log(`The file ${path} already exists.`);
			return;
		}

		const dir = pathModule.dirname(path);
		await fs.mkdir(dir, { recursive: true });

		await fs.writeFile(path, "");
		console.log("File successfully created!");
	} catch (error) {
		if (error.code === "ENOENT") {
			console.log(`Invalid path: ${path}`);
			return;
		}
		console.log(`Error creating file: ${error.message}`);
	}
}

async function deleteFile(path) {
	try {
		const fileExists = await checkFileExists(path);

		if (!fileExists) {
			console.log(`The file ${path} does not exist.`);
			return;
		}

		await fs.unlink(path);
		console.log("File successfully deleted!");
	} catch (error) {
		if (error.code === "ENOENT") {
			console.log(`Invalid path: ${path}`);
			return;
		}
		console.log(`Error deleting file: ${error.message}`);
	}
}

async function renameFile(oldFilePath, newFilePath) {
	try {
		const fileExists = await checkFileExists(oldFilePath);

		if (!fileExists) {
			console.log(`The file ${oldFilePath} does not exist.`);
			return;
		}

		await fs.rename(oldFilePath, newFilePath);
		console.log("File successfully renamed!");
	} catch (error) {
		if (error.code === "ENOENT") {
			console.log(`Invalid path: ${oldFilePath}`);
			return;
		}
		console.log(`Error renaming file: ${error.message}`);
	}
}

async function addToFile(path, contentToAdd) {
	try {
		const fileExists = await checkFileExists(path);

		if (!fileExists) {
			console.log(`The file ${path} does not exist.`);
			return;
		}

		await fs.appendFile(path, contentToAdd);
		console.log("File successfully updated!");
	} catch (error) {
		if (error.code === "ENOENT") {
			console.log(`Invalid path: ${path}`);
			return;
		}
		console.log(`Error when adding to file: ${error.message}`);
	}
}

async function readFile(path) {
	return await fs.readFile(path, "utf-8");
}

module.exports = {
	start,
};
