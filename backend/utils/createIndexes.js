const mongoose = require('mongoose');

const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Indexes for Doubt collection
    await db.collection('doubts').createIndex({ 
      title: 'text', 
      description: 'text' 
    }, { 
      name: 'search_index' 
    });
    
    await db.collection('doubts').createIndex({ 
      tags: 1 
    }, { 
      name: 'tags_index' 
    });
    
    await db.collection('doubts').createIndex({ 
      createdAt: -1 
    }, { 
      name: 'created_date_index' 
    });
    
    await db.collection('doubts').createIndex({ 
      createdBy: 1 
    }, { 
      name: 'author_index' 
    });

    // Indexes for Answer collection
    await db.collection('answers').createIndex({ 
      doubt: 1 
    }, { 
      name: 'doubt_answers_index' 
    });
    
    await db.collection('answers').createIndex({ 
      createdAt: -1 
    }, { 
      name: 'answer_date_index' 
    });

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

module.exports = createIndexes;