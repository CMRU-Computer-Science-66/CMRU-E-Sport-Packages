export default function isValidPassword(record?: Record<"password" | "confirmPassword", string>): boolean {
	if (record.password !== record.confirmPassword) {
		throw new Error("Confirm Password does not match");
	}

	return true;
}
