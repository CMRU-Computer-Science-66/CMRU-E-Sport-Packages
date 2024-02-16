import isValidPassword from "./passwords";
import isValidUsername from "./username";

export default function isValidCredentials(credentials?: Record<string, string>): boolean {
	if (!credentials || Object.values(credentials).some((value) => !value)) {
		throw new Error("Please fill in the information completely.");
	}

	if (credentials?.username) {
		isValidUsername(credentials.username);
	}

	if (credentials?.password && credentials.confirmPassword) {
		isValidPassword(credentials);
	}

	return true;
}
