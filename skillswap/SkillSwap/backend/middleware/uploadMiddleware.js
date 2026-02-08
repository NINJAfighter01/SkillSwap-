const multer = require('multer');

// Set up storage engine for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Append timestamp to the original file name
  }
});

// Initialize upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // Limit file size to 5MB
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf/; // Allowed file types
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(file.originalname.split('.').pop().toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: File type not supported!'));
  }
});

// Export the upload middleware
module.exports = upload;