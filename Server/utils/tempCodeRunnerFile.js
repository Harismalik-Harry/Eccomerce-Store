import {v2 as cloudinary} from 'cloudinary'
// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: "dl7n1vqc0",
  api_key: "377481438931384",
  api_secret: "D0WFd60fPhRqt2XpfLdjoh2UIyw",
});

// List and delete all resources
cloudinary.api
  .resources()
  .then((result) => {
    result.resources.forEach((resource) => {
      cloudinary.api.delete_resources(resource.public_id);
    });
  })
  .catch((error) => console.log(error));
