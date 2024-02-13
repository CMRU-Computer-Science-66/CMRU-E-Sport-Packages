export default function isValidUsername(username: string): boolean {
	const usernameRegex = /^[\dA-Za-z]+$/;

	if (!usernameRegex.test(username)) {
		throw new Error("Username allow characters (a-z,0-9)");
	}

	return true;
}
