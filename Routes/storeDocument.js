const express = require('express');
const router = express.Router();
const DynamicModel = require('../Models/section');
const User = require('../Models/user');

router.get('/document/:id', async (req, res) => {
  try {
    const { id } = req.params; // Extract 'userid' from the route parameters
    const documents = await DynamicModel.find({ user: id }); // Query for documents where the 'userid' matches

    if (documents.length === 0) {
      return res.status(404).json({ message: 'No documents found for this user ID' });
    }

    // Send success response with the found documents
    res.status(200).json({ data: documents });

  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// POST new document
router.post('/store-document', async (req, res) => {
  try {
    const { content, fileName, userEmail } = req.body;

    // Validate required fields
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    if (!fileName) {
      return res.status(400).json({ error: 'File name is required' });
    }
    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }

    // Find the user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create the document with the user's ID
    const document = new DynamicModel({
      user: user._id,  // Use the user's ObjectId
      content,
      fileName
    });

    const savedDocument = await document.save();
    res.status(201).json({
      message: 'Document stored successfully',
      documentId: savedDocument._id,
      document: savedDocument
    });
  } catch (error) {
    console.error('Error storing document:', error);
    
    // Provide more detailed error response
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ error: 'Error storing document' });
  }
});

// PUT update existing document
router.put('/documents/:id', async (req, res) => {
  try {
    const { content, fileName } = req.body;
    
    if (!fileName) {
      return res.status(400).json({ error: 'File name is required' });
    }

    const updatedDocument = await DynamicModel.findByIdAndUpdate(
      req.params.id,
      {
        content,
        fileName,
      },
      { new: true } 
    );

    if (!updatedDocument) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      message: 'Document updated successfully',
      document: updatedDocument
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Error updating document' });
  }
});

// DELETE document
router.delete('/documents/:id', async (req, res) => {
  try {
    const document = await DynamicModel.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Error deleting document' });
  }
});

module.exports = router;