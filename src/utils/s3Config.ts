import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-1", // Railway may use another region or endpoint
  endpoint: process.env.S3_ENDPOINT, // Required for MinIO (ex: http://localhost:9000)
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true, // Required for MinIO
});

export const getSignedUrlForS3 = async (fileName: string, expiresInSeconds: number = 3600): Promise<string> => {
  const bucketName = process.env.S3_BUCKET_NAME || "default-bucket";

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
};

export const uploadFileToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  mimetype: string
): Promise<string> => {
  const bucketName = process.env.S3_BUCKET_NAME || "default-bucket";

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  await s3Client.send(command);

  // Agora retornamos uma Signed URL para visualização imediata com segurança
  return await getSignedUrlForS3(fileName, 3600);
};

export const downloadFileFromS3 = async (fileUrl: string): Promise<Buffer> => {
  const bucketName = process.env.S3_BUCKET_NAME || "default-bucket";

  // Extrai apenas o fileName da URL (o que vem depois da última barra e antes dos query params)
  const parts = fileUrl.split("/");
  const fileNameWithParams = parts[parts.length - 1];
  const fileName = fileNameWithParams.split("?")[0];

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });

  const response = await s3Client.send(command);

  // O tipo de Body padrão pode ser Readable no Node, então podemos converter pra Buffer:
  const streamToBuffer = (stream: any): Promise<Buffer> =>
    new Promise((resolve, reject) => {
      const chunks: any[] = [];
      stream.on("data", (chunk: any) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks)));
    });

  if (response.Body) {
    if (typeof (response.Body as any).transformToByteArray === "function") {
      const byteArray = await (response.Body as any).transformToByteArray();
      return Buffer.from(byteArray);
    }
    return streamToBuffer(response.Body);
  }

  throw new Error("S3 GetObjectCommand não retornou um Corpo de dados (Body)");
};

export const clearS3Bucket = async (): Promise<void> => {
  const bucketName = process.env.S3_BUCKET_NAME || "default-bucket";

  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
    });

    const listResponse = await s3Client.send(listCommand);

    if (listResponse.Contents && listResponse.Contents.length > 0) {
      const objectsToDelete = listResponse.Contents.map((obj) => ({
        Key: obj.Key as string,
      }));

      const deleteCommand = new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: objectsToDelete,
        },
      });

      await s3Client.send(deleteCommand);
      console.log(`Todos os ${objectsToDelete.length} objetos foram removidos do bucket: ${bucketName}.`);
    } else {
      console.log(`Bucket já estava vazio ou não contém arquivos: ${bucketName}.`);
    }
  } catch (error) {
    console.error("Erro ao limpar bucket S3:", error);
    throw error;
  }
};

export default s3Client;
