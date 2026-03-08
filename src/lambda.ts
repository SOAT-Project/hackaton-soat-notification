import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import {
	CognitoIdentityProviderClient,
	AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { renderTemplate } from "./templateService";

const ses = new SESClient({ region: process.env.AWS_REGION || "sa-east-1" });
const cognito = new CognitoIdentityProviderClient({
	region: process.env.AWS_REGION || "sa-east-1",
});

enum VideoStatus {
	PENDING = "PENDING",
	PROCESSED = "PROCESSED",
	FAILURE = "FAILURE",
}

interface NotifySQSEventBody {
	user_id: string;
	status: VideoStatus;
	error_message: string;
	video_name: string;
	video_id: string;
}

interface SQSEventRecord {
	body: string;
}

interface SQSEvent {
	Records: SQSEventRecord[];
}

export const handler = async (event: SQSEvent) => {
	for (const record of event.Records) {
		let notifyData: NotifySQSEventBody;
		try {
			notifyData = JSON.parse(record.body);
		} catch (err) {
			console.error("Erro ao parsear body do SQS", err);
			continue;
		}

		let userEmail = null;
		try {
			const userPoolId = process.env.COGNITO_USER_POOL_ID;
			if (!userPoolId)
				throw new Error("COGNITO_USER_POOL_ID não definido no .env");
			const userResp = await cognito.send(
				new AdminGetUserCommand({
					UserPoolId: userPoolId,
					Username: notifyData.user_id,
				}),
			);
			const emailAttr = userResp.UserAttributes?.find(
				(attr) => attr.Name === "email",
			);
			userEmail = emailAttr?.Value || null;
		} catch (err) {
			console.error("Erro ao buscar usuário no Cognito", err);
			continue;
		}

		if (!userEmail) {
			console.error(
				"Email do usuário não encontrado no Cognito",
				notifyData.user_id,
			);
			continue;
		}

		let emailBody = "";
		let emailSubject = "";
		try {
			if (notifyData.status === VideoStatus.PROCESSED) {
				emailSubject = `Vídeo processado com sucesso: ${notifyData.video_name}`;
				emailBody = await renderTemplate("success-notification", {
					videoName: notifyData.video_name,
					errorMessage: notifyData.error_message,
				});
			} else if (notifyData.status === VideoStatus.FAILURE) {
				emailSubject = `Erro no processamento do vídeo: ${notifyData.video_name}`;
				emailBody = await renderTemplate("error-notification", {
					videoName: notifyData.video_name,
				});
			}
		} catch (err) {
			console.error("Erro ao renderizar template", err);
			continue;
		}

		const params = {
			Destination: {
				ToAddresses: [userEmail],
			},
			Message: {
				Body: {
					Text: { Data: emailBody, Charset: "UTF-8" },
				},
				Subject: {
					Data: emailSubject,
					Charset: "UTF-8",
				},
			},
			Source: process.env.SES_FROM_EMAIL || "",
		};

		try {
			const result = await ses.send(new SendEmailCommand(params));
			console.log("Email enviado com sucesso", result);
		} catch (error) {
			console.error("Erro ao enviar email", error);
		}
	}
	return {
		statusCode: 200,
		body: JSON.stringify({ message: "Processamento concluído" }),
	};
};
