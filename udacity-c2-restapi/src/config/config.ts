export const config = {
  dev: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    aws_region: process.env.AWS_REGION,
    aws_profile: process.env.AWS_PROFILE,
    aws_media_bucket: process.env.AWS_MEDIA_BUCKET
  },
  image_processing:{
    url: process.env.IMAGE_PROCESSING_SERVER,
    token: process.env.IMAGE_PROCESSING_TOKEN
  },
  jwt: {
    secret: process.env.SECRET_KEY,
  }
};
