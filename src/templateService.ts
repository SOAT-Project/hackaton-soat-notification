import fs from "fs";
import path from "path";
import handlebars from "handlebars";

export async function renderTemplate(
	templateName: string,
	variables: Record<string, any>,
): Promise<string> {
	const templatePath = path.join(
		__dirname,
		"templates",
		`${templateName}.hbs`,
	);
	const templateContent = await fs.promises.readFile(templatePath, "utf-8");
	const compiled = handlebars.compile(templateContent);
	return compiled(variables);
}
