import * as fs from "node:fs/promises";

import fg from "fast-glob";

const orgName = {
	npm: "@cmru-comsci-66",
	github: "@cmru-computer-science-66",
};

async function updatePackageNames(packageJsonPath: string, name: string): Promise<void> {
	try {
		const packageJsonContent = await fs.readFile(packageJsonPath);
		const packageJson = JSON.parse(packageJsonContent);

		const [, packageName] = packageJson.name.split("/");
		switch (name) {
			case "npm": {
				packageJson.name = `${orgName.npm}/${packageName}`;
				break;
			}
			case "github": {
				packageJson.name = `${orgName.github}/${packageName}`;
				break;
			}
		}

		if (packageJson.devDependencies) {
			const updatedDevelopmentDependencies = {};

			for (const [key, value] of Object.entries(packageJson.devDependencies)) {
				let updatedKey = key;

				if (packageJson.name.includes(orgName.github)) {
					updatedKey = key.replace(orgName.npm, orgName.github);
				} else if (packageJson.name.includes(orgName.npm)) {
					updatedKey = key.replace(orgName.github, orgName.npm);
				}

				updatedDevelopmentDependencies[updatedKey] = value;
			}

			packageJson.devDependencies = updatedDevelopmentDependencies;
		}

		console.log(packageJson.name);
		await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, undefined, 3), "utf8");
	} catch (error) {
		console.error("Error:", error);
	}
}

// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
	try {
		const files = await fg("./**/package.json", { ignore: ["./package.json", "database/client/package.json", "**/node_modules/**"] });

		console.log(files);
		await Promise.all(files.map((packageJsonPath) => updatePackageNames(packageJsonPath, process.argv[2])));
	} catch (error) {
		console.error("Error:", error);
	}
})();
