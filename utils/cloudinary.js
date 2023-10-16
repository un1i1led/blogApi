const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "DEV",
    },
});

const upload = multer({ storage: storage });

const uploadImg = (img) => {
    try {
        cloudinary.uploader.upload(img).then((res) => console.log(res))
    } catch (e) {
        console.log(e);
    }
}

const signatureUpload = () => {
    const timestamp = Math.round((new Date).getTime()/1000);

    const signature = cloudinary.utils.api_sign_request({
        timestamp: timestamp,
        api_secret: process.env.CLOUD_API_SECRET
    })

    return { timestamp, signature }
}

module.exports = { signatureUpload, upload }