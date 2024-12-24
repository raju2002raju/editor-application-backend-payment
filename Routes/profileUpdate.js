const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../Routes/cloudinaryConfig'); // Import the configured Cloudinary instance
const User = require('../Models/user');

const upload = multer({ storage: multer.memoryStorage() });


router.post('/update', upload.single('profileImage'), async (req, res) => {
  const { name, email: profileEmail } = req.body;
  const originalEmail = req.headers['user-email']; 

  try {
    let profileImageUrl = null;

    // Find the current user to get the existing profile image
    const currentUser = await User.findOne({ email: originalEmail });
    if (!currentUser) {
      return res.status(404).send('User not found');
    }

    // Check if a new profile image is uploaded
    if (req.file) {
      const uploadToCloudinary = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'profile_images' },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        uploadStream.end(req.file.buffer);
      });

      const result = await uploadToCloudinary;
      profileImageUrl = result.secure_url;
    } else {
      // Retain the current profile image URL
      profileImageUrl = currentUser.profileImage;
    }

    // Update user data
    const user = await User.findOneAndUpdate(
      { email: originalEmail },
      { name, email: profileEmail, profileImage: profileImageUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.status(200).send({ message: 'Profile updated successfully', profileImageUrl });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send('Server error');
  }
});


module.exports = router;
