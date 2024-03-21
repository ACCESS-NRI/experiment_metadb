import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {fromCognitoIdentityPool} from "@aws-sdk/credential-providers";

//TODO: Move to env
const REGION = "ap-southeast-2";
const IDENTITY_POOL = "ap-southeast-2:56fd4dd7-be99-4920-9df8-cf667e4ddf62"
const BUCKET_NAME = "experiment-timeline"

const s3Client = new S3Client({
    region: REGION,
    credentials: fromCognitoIdentityPool({
      clientConfig: { region: REGION },
      identityPoolId: IDENTITY_POOL,
    })
});

export const getObjectFromS3 = async (objectName) => {
    try {
        const data = await s3Client.send(
            new GetObjectCommand({Bucket: BUCKET_NAME, Key: objectName}));
            
        return await data.Body.transformToString()
        
    } catch (e) {
        console.log(e)
    }
}

